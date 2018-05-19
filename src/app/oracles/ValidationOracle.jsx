const Web3 = require("web3");
const http = require("http");
const path = require("path");
const bs58 = require('bs58');
const contract = require("truffle-contract");
const ipfsAPI = require('ipfs-api');
let ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');


const ComputationManagerJSON = require(path.join(__dirname, "../../../build/contracts/ComputationManager.json"));
const ComputationRegistryJSON = require(path.join(__dirname, "../../../build/contracts/ComputationRegistry.json"));

const ResultManagerJSON = require(path.join(__dirname, "../../../build/contracts/ResultManager.json"));

const errors = require("../helpers/error_codes.js");

let dataset_methods = require('../helpers/dataset_manager');
let getDatasetByID = dataset_methods.getDatasetByID;
let checkDataset = dataset_methods.checkDataset;

let software_methods = require('../helpers/software_manager');
let getSoftwareByID = software_methods.getSoftwareByID;
let checkSoftware = software_methods.checkSoftware;

let container_methods = require('../helpers/container_manager');
let getContainerByID = container_methods.getContainerByID;
let getDockerContainerID = container_methods.getDockerContainerID;
let getContainerStatus = container_methods.getContainerStatus;


const ERROR_STATUS = "FAILURE";

function initWeb3() {
    let web3;

    console.log("Initializing web3");
    if (typeof web3 !== "undefined") {
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
    }
    return web3;
}

function initContract(artifact) {
    let MyContract = contract(artifact);
    MyContract.setProvider(web3.currentProvider);

    //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
    if (typeof MyContract.currentProvider.sendAsync !== "function") {
        MyContract.currentProvider.sendAsync = function () {
            return MyContract.currentProvider.send.apply(MyContract.currentProvider, arguments);
        };
    }
    return MyContract;
}

async function watchComputationEvents(web3, oracleAccount) {
    console.log("Listening computation events...");

    let latestBlock = await web3.eth.getBlockNumber();

    let ComputationRegistry = initContract(ComputationRegistryJSON);
    let deployedComputationRegistry = await ComputationRegistry.deployed();

    let ComputationManager = initContract(ComputationManagerJSON);
    let deployedComputationManager = await ComputationManager.deployed();

    deployedComputationManager.ComputationAdded({fromBlock: latestBlock}, async (error, event) => {
        if (error) {
            console.log(error);
        } else {
            if (event.blockNumber !== latestBlock) {
                console.log("EVENT Received: ", event.args);

                //TODO can get ids from computation registry?? event in ComputationManager can return only the computationID
                let computationID = event.args.computationID;
                let userPubKeyIpfs = event.args.userPubKeyIpfsHash;
                let softwareID = event.args.softwareID;
                let datasetID = event.args.datasetID;
                let containerID = event.args.containerID;
                let computationInfo = await deployedComputationRegistry.idToComputationInfo.call(computationID, {from: oracleAccount});
                let amountInComputation = computationInfo[5].toNumber();

                const convert = (short) => bs58.encode(Buffer.from('1220' + short.slice(2), 'hex'));
                let userPubKeyIpfsHash = convert(userPubKeyIpfs);

                // CHECK IF AMOUNT SENT IN CONTRACT IS EQUAL TO THE AMOUNT OF THE SELECTED SOFTWARE, DATASET, CONTAINER
                let enoughFunds = await verifyFunds(softwareID, datasetID, containerID, amountInComputation, oracleAccount);

                let datasetMatch = await checkDataset(web3, datasetID, oracleAccount);
                let softwareMatch = await checkSoftware(web3, softwareID, oracleAccount);

                let containerDockerID = await getDockerContainerID(web3, containerID, oracleAccount);
                let containerAlive = await getContainerStatus(containerDockerID);

                console.log(enoughFunds, datasetMatch[0], softwareMatch[0], containerAlive);
                if (enoughFunds && datasetMatch[0] && softwareMatch[0] && containerAlive) {
                    console.log("-------------- COMPUTATION VALID --------------");

                    let ds = await getDatasetByID(web3, datasetID, oracleAccount);
                    let randomKeyipfsHash = ds.dsRandomKeyipfsHash;
                    // let dsRandKeyContents = (await ipfs.files.cat(randomKeyipfsHash)).toString('utf8');

                    let userPubKeyContents = (await ipfs.files.cat(userPubKeyIpfsHash)).toString('utf8');
                    // CREATE EXEC INSTANCE
                    let execResult = await createExecInstance(containerDockerID, datasetMatch[1], softwareMatch[1], userPubKeyContents, randomKeyipfsHash);

                    if (execResult[0] === "FAILURE") {

                        // Cannot create exec instance
                        console.log("[Error creating exec instance.");

                        let msg = "Error before execution.";
                        await handleError(msg, oracleAccount);
                        await returnFunds(computationID, oracleAccount);
                        console.log("Funds returned");
                    } else {
                        let exec_id = JSON.parse(execResult[1]).Id;

                        console.log("Execute exec_id: ", exec_id);
                        // EXECUTE
                        let result = await runExec(exec_id);

                        result = result.replace(/[\u0001\u0000\u0004^]/g, "");
                        result = result.trim();

                        let error_codes_array = errors.getErrorCodes();
                        if (error_codes_array.includes(parseInt(result))) {
                            let error_msg = errors.getErrorMessage(parseInt(result));

                            console.log(error_msg);
                            await handleError(error_msg, oracleAccount);
                            await returnFunds(computationID, oracleAccount);
                            console.log("Funds returned");
                        } else {
                            result = result.replace(/\//g, ""); // remove '/' from ipfs address result
                            console.log("Final result received", result);

                            let successPayment = await execPayment(computationID, oracleAccount);

                            // computation succeed - funds transferred to providers
                            if (successPayment === 0) {

                                let resultOwner = computationInfo[4];

                                let successStore = await storeResult(resultOwner, result, oracleAccount);

                                if (successStore === 1) {
                                    await handleError("Failed to store result.", oracleAccount);
                                    await returnFunds(computationID, oracleAccount);
                                    console.log("Failed to store the result for the computation ", computationID, ". Funds returned.");
                                }
                                // Computation failed to fulfill - funds returned to buyer
                            } else {
                                await handleError("Failed to fulfill computation.", oracleAccount);
                                await returnFunds(computationID, oracleAccount);
                                console.log("Failed to fulfill the computation ", computationID, ". Funds returned.");
                            }
                        }
                    }
                    latestBlock = latestBlock + 1;
                } else {
                    let error_msg = "Cannot add computation ";
                    await handleError(error_msg, oracleAccount);

                    await returnFunds(computationID, oracleAccount);
                    console.log("Computation", computationID, " cannot be placed. Funds returned.");
                }
            }
        }
    });
}

async function createExecInstance(containerID, datasetIpfsHash, softwareIPFSHash, userPubKeyContents, dsRandKeyIPFS) {
    console.log("[CreateExecInstance] ", containerID, datasetIpfsHash, softwareIPFSHash, userPubKeyContents, dsRandKeyIPFS);

    // let b64Encoded = Buffer.from(dsRandKeyContents).toString('base64');
    // console.log(b64Encoded);
    // console.log(Buffer.from(b64Encoded, 'base64').toString());

    let commands = ["./wrapper.sh", datasetIpfsHash, softwareIPFSHash, userPubKeyContents, dsRandKeyIPFS];
    let bodyCmd = JSON.stringify({
        Cmd: commands,
        AttachStdout: true
    });
    let path = "/containers/" + containerID + "/exec";
    let post_options = {
        socketPath: "/var/run/docker.sock",
        path: path,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyCmd)
        }
    };
    return new Promise(resolve => {
        let post_req = http.request(post_options, function (res) {
            res.setEncoding("utf8");
            let status = res.statusCode;
            console.log("STATUS: " + status);

            let rawData = "";
            res
                .on("data", function (chunk) {
                    rawData += chunk;
                    console.log("Response: " + chunk);
                })
                .on("end", () => {
                    console.log("RESULT = ", rawData);
                    let error_codes_array = errors.getErrorCodes();

                    if (error_codes_array.includes(parseInt(status))) {
                        console.log("Error creating exec instance.");
                        resolve([ERROR_STATUS, errors.getErrorMessage(parseInt(status))]);
                    } else {
                        resolve([status, rawData]);
                    }
                })
                .on("error", e => {
                    console.log("ERROR", e);
                    resolve(1, "Failed to create exec command.");
                });
        });
        post_req.write(bodyCmd);
        post_req.end();
    })
}

async function runExec(execID) {

    let bodyCmd = JSON.stringify({});
    let post_options = {
        socketPath: "/var/run/docker.sock",
        path: "/exec/" + execID + "/start",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyCmd)
        }
    };

    return new Promise(resolve => {
        let post_req = http.request(post_options, function (res) {
            // res.setEncoding("utf8");
            let status = res.statusCode;
            console.log("STATUS: " + status);

            let output = "";

            res.on("data", function (chunk) {
                console.log("Response:" + chunk);
                output += chunk;
            });

            res.on("end", () => {
                console.log("RESULT:", output);
                if (status === 200)
                    resolve(output);
                else
                    resolve(status);
            });

            res.on("error", e => {
                console.log("ERROR", e);
                resolve(1, "Failed to run exec command.");
            });
        });
        post_req.write(bodyCmd);
        post_req.end();
    })
}

async function execPayment(computationID, oracleAccount) {
    let ComputationManager = initContract(ComputationManagerJSON);
    let deployedComputationManager = await ComputationManager.deployed();

    try {
        let success = await deployedComputationManager.computationSucceed(computationID, {
            from: oracleAccount,
            gas: 3000000
        });
        console.log("PAYMENT DONE");
        return 0;
    } catch (e) {
        console.log(e);
        return 1;
    }
}

async function returnFunds(computationID, oracleAccount) {

    let ComputationManager = initContract(ComputationManagerJSON);
    let deployedComputationManager = await ComputationManager.deployed();

    try {
        let success = await deployedComputationManager.computationFailed(computationID, {from: oracleAccount});
    } catch (e) {
        console.log(e);
    }
}

async function storeResult(resultOwner, result, oracleAccount) {
    console.log("[storeResult] - Storing result...", result);
    //result is a space separated string of the dataset IPFS hash and the random key IPFS hash

    // Convert IPFS hash to bytes32 size according to: https://digioli.co.uk/2018/03/08/converting-ipfs-hash-32-bytes/
    let ipfsHashes = result.split(" ");
    let datasetIpfsAddress = ipfsHashes[0];
    let passwordIpfsAddress = ipfsHashes[1];


    let shortDataResult = '0x' + bs58.decode(datasetIpfsAddress).slice(2).toString('hex');
    console.log(shortDataResult);
    let shortPassword = '0x' + bs58.decode(passwordIpfsAddress).slice(2).toString('hex');
    console.log(shortPassword);

    let ResultManager = initContract(ResultManagerJSON);
    let deployedResultManager = await ResultManager.deployed();

    try {
        let success = await deployedResultManager.addResultInfo(resultOwner ,shortDataResult, shortPassword, {from: oracleAccount, gas: 3000000});
        console.log("[storeResult] - Result stored");
        return 0;
    } catch (e) {
        return 1;
    }
}

async function handleError(msg, oracleAccount) {
    console.log("[handleError] - Reporting error ");
    let ResultManager = initContract(ResultManagerJSON);
    let deployedResultManager = await ResultManager.deployed();
    try {
        let res = await deployedResultManager.resultError(web3.utils.fromAscii(msg), {from: oracleAccount});
        return 0;
    } catch (e) {
        return 1;
    }

}

async function verifyFunds(softwareID, datasetID, containerID, fundsInComputation, oracleAccount) {
    let sw = await getSoftwareByID(web3, softwareID, oracleAccount);
    let swCost = sw.cost;

    let ds = await getDatasetByID(web3, datasetID, oracleAccount);
    let dsCost = ds.cost;

    let container = await getContainerByID(web3, containerID, oracleAccount);
    let containerCost = container.cost;
    let expectedCost = +swCost + +dsCost + +containerCost;

    return expectedCost === fundsInComputation;

}


let web3 = initWeb3();

web3.eth.getAccounts().then(accounts => {
    let oracleAccount = accounts[9];
    watchComputationEvents(web3, oracleAccount).then();
});



