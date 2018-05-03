const Web3 = require("web3");
const http = require("http");
const contract = require("truffle-contract");
const path = require("path");
const bs58 = require('bs58');

const OrderManagerJSON = require(path.join(__dirname,"../../../build/contracts/OrderManager.json"));
const OrderDbJSON = require(path.join(__dirname,"../../../build/contracts/OrderDb.json"));
const ResultRegistryJSON = require(path.join(__dirname,"../../../build/contracts/ResultRegistry.json"));

const errors = require("../helpers/error_codes.js");

// let web3_manager = require('../helpers/web3_manager');
// let getWeb3 = web3_manager.initWeb3();

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

let contract_manager = require('../helpers/contract_manager');
let addContracts = contract_manager.addContracts;
let initContract = contract_manager.initContract;


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

// function initContract(artifact) {
//     let MyContract = contract(artifact);
//     MyContract.setProvider(web3.currentProvider);
//
//     //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
//     if (typeof MyContract.currentProvider.sendAsync !== "function") {
//         MyContract.currentProvider.sendAsync = function () {
//             return MyContract.currentProvider.send.apply(MyContract.currentProvider, arguments);
//         };
//     }
//     return MyContract;
// }

async function watchOrderEvents(web3, oracleAccount) {
    console.log("Listening for smart contract order_manager events...");

    let latestBlock = await web3.eth.getBlockNumber();

    let OrderDb = initContract(web3, OrderDbJSON);
    let deployedOrderDb = await OrderDb.deployed();

    deployedOrderDb.OrderPlaced({fromBlock: latestBlock}, async (error, event) => {
        if (error) {
            console.log(error);
        } else {
            if (event.blockNumber !== latestBlock) {
                //TODO get read ipfs (maybe)
                let userPubKey = '-----BEGIN PUBLIC KEY-----\n' +
                    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDEJQ3O9G+DjeR9/ylAh7lC131o\n' +
                    'JxCtfQkKxSk9IOgqKvZN8/mUEgFTOn8jFokThmP9QJvHNKN0ZMbtxnucMIFN38Y0\n' +
                    'WVO13aybYpSrIETytZetKKMgIF0s6Aw5a0jnu3V/GcjAap2XolRP8TR+mRhd6vII\n' +
                    'xGdT+PiEBfYubyKZHwIDAQAB\n' +
                    '-----END PUBLIC KEY-----\n';
                console.log("EVENT Received: ", event.args);
                console.log(userPubKey);

                let orderID = event.args.orderID;
                let softwareID = event.args.softwareID;
                let datasetID = event.args.datasetID;
                let containerID = event.args.containerID;

                let orderInfo = await deployedOrderDb.orderRegistry.call(orderID, {from: oracleAccount});
                let amountInOrder = orderInfo[5].toNumber();

                // CHECK IF AMOUNT SENT IN CONTRACT IS EQUAL TO THE AMOUNT OF THE SELECTED SOFTWARE, DATASET, CONTAINER
                let enoughFunds = await verifyFunds(softwareID, datasetID, containerID, amountInOrder, oracleAccount);

                let datasetMatch = await checkDataset(web3, datasetID, oracleAccount);
                let softwareMatch = await checkSoftware(web3, softwareID, oracleAccount);

                let containerDockerID = await getDockerContainerID(web3, containerID, oracleAccount);
                let containerAlive  = await getContainerStatus(containerDockerID);

                if (enoughFunds && datasetMatch[0] && softwareMatch[0] && containerAlive) {
                    console.log("-------------- ORDER VALID --------------");
                    // CREATE EXEC INSTANCE
                    let execResult = await createExecInstance(containerDockerID, datasetMatch[1], softwareMatch[1], userPubKey);

                    if (execResult[0] === "FAILURE") {

                        // Cannot create exec instance
                        console.log("[Error creating exec instance.");

                        let msg = "Error before execution.";
                        await handleError(web3, msg, oracleAccount);
                        await returnFunds(web3, orderID, oracleAccount);
                        console.log("Funds returned");
                    } else {
                        let exec_id = JSON.parse(execResult[1]).Id;

                        console.log("Execute exec_id: ", exec_id);
                        // EXECUTE
                        let result = await runExec(exec_id);

                        result = result.replace(/[\u0001\u0000\u0004]/g, "");
                        result = result.trim();

                        let error_codes_array = errors.getErrorCodes();
                        if (error_codes_array.includes(parseInt(result))) {
                            let error_msg = errors.getErrorMessage(parseInt(result));

                            console.log(error_msg);
                            await handleError(web3, error_msg, oracleAccount);
                            await returnFunds(web3, orderID, oracleAccount);
                            console.log("Funds returned");
                        } else {
                            result = result.replace(/\//g, ""); // remove '/' from ipfs address result
                            console.log("Final result received",result);

                            let successPayment = await execPayment(web3, orderID, oracleAccount);

                            // Order fulfilled - funds transferred to providers
                            if(successPayment === 0) {

                                let resultOwner = orderInfo[4];

                                let successStore = await storeResult(web3, resultOwner, result, oracleAccount);

                                if(successStore === 1) {
                                    await handleError(web3, "Failed to store result.", oracleAccount);
                                    await returnFunds(web3, orderID, oracleAccount);
                                    console.log("Failed to store the result for the order ",orderID,". Funds returned.");
                                }
                            // Order failed to fulfill - funds returned to buyer
                            } else {
                                await handleError(web3, "Failed to fulfill order.", oracleAccount);
                                await returnFunds(web3, orderID, oracleAccount);
                                console.log("Failed to fulfill the order ",orderID,". Funds returned.");
                            }
                        }
                    }
                    latestBlock = latestBlock + 1;
                } else {
                    let error_msg = "Cannot place order_manager.";
                    await handleError(web3, error_msg, oracleAccount);

                    await returnFunds(web3, orderID, oracleAccount);
                    console.log("Order",orderID," cannot be placed. Funds returned.");
                }
            }
        }
    });
}


async function createExecInstance(containerID, datasetIpfsHash, softwareIPFSHash, userPubKey) {
    console.log("[CreateExecInstance] ", containerID, datasetIpfsHash, softwareIPFSHash);

    let commands = ["./wrapper.sh", datasetIpfsHash, softwareIPFSHash, userPubKey];
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
                if(status === 200)
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

async function execPayment(web3, orderID, oracleAccount) {
    let OrderManager = initContract(web3, OrderManagerJSON);
    let deployedOrderManager = await OrderManager.deployed();

    try {
        let success = await deployedOrderManager.fulfillOrder(orderID, {from: oracleAccount, gas: 3000000});
        console.log("PAYMENT DONE");
        return 0;
    } catch (e) {
        console.log(e);
        return 1;
    }
}

async function returnFunds(web3, orderID, oracleAccount) {

    let OrderManager = initContract(web3, OrderManagerJSON);
    let deployedOrderManager = await OrderManager.deployed();

    try {
        let success = await deployedOrderManager.cancelOrder(orderID, {from: oracleAccount});
    } catch (e) {
        console.log(e);
    }
}

async function storeResult(web3, resultOwner, result, oracleAccount) {
    //result is an IPFS hash
    // Convert IPFS hash to bytes32 size according to: https://digioli.co.uk/2018/03/08/converting-ipfs-hash-32-bytes/
    let shortResult = '0x' + bs58.decode(result).slice(2).toString('hex');

    let ResultRegistry = initContract(web3, ResultRegistryJSON);
    let deployedResultRegistry = await ResultRegistry.deployed();

    try {
        let success = await deployedResultRegistry.addNewResult(resultOwner, shortResult, {from: oracleAccount});
        console.log("RESULT STORED");
        return 0;
    } catch (e) {
        return 1;
    }
}

async function handleError(web3, msg, oracleAccount) {

    let ResultRegistry = initContract(web3, ResultRegistryJSON);
    let deployedResultRegistry = await ResultRegistry.deployed();
    let res = await deployedResultRegistry.errorInResult(web3.utils.fromAscii(msg), {from: oracleAccount});
}

async function verifyFunds(softwareID, datasetID, containerID, fundsInOrder, oracleAccount) {

    let sw = await getSoftwareByID(web3, softwareID, oracleAccount);
    let swCost = sw.cost;

    let ds = await getDatasetByID(web3, datasetID, oracleAccount);
    let dsCost = ds.cost;

    let container = await getContainerByID(web3, containerID, oracleAccount);
    let containerCost = container.cost;
    let expectedCost = +swCost + +dsCost + +containerCost;

    return expectedCost === fundsInOrder;

}


let web3 = initWeb3();

web3.eth.getAccounts().then(accounts => {
    let oracleAccount = accounts[9];
    addContracts(web3, oracleAccount).then(() => {
        console.log("Contracts added to CMC");
        watchOrderEvents(web3, oracleAccount).then();
    });
});



