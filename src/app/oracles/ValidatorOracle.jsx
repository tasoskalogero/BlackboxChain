const http = require("http");
const contract = require("truffle-contract");
const path = require("path");
const Web3 = require("web3");

const OrderJSON = require(path.join(__dirname,"../../../build/contracts/Order.json"));
const codes = require("../helpers/error_codes.js");

let dataset_methods = require('../helpers/dataset_manager');
let getDatasetCost = dataset_methods.getDatasetCost;
let checkDataset = dataset_methods.checkDataset;

let software_methods = require('../helpers/software_manager');
let getSoftwareCost = software_methods.getSoftwareCost;
let checkSoftware = software_methods.checkSoftware;

let container_methods = require('../helpers/container_manager');
let getContainerCost = container_methods.getContainerCost;
let getDockerContainerID = container_methods.getDockerContainerID;
let getContainerStatus = container_methods.getContainerStatus;


let web3;
const ERROR_STATUS = "FAILURE";

function initWeb3() {
    console.log("Initializing web3");
    if (typeof web3 !== "undefined") {
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
    }
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


async function watchEvents() {
    let accounts = await web3.eth.getAccounts();
    let currentAccount = accounts[9];

    let latestBlock = await web3.eth.getBlockNumber();
    let OrderContract = initContract(OrderJSON);
    let orderReceipt = await OrderContract.deployed();

    orderReceipt.OrderEvent({fromBlock: latestBlock}, async (error, event) => {
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

                let orderInfo = await orderReceipt.getOrderByID.call(event.args.orderID, {from: currentAccount});

                let successFunds = await verifyFunds(event.args.softwareID,event.args.datasetID, event.args.containerID, orderInfo[4].toNumber());

                let datasetMatch = await checkDataset(web3, event.args.datasetID);
                let softwareMatch = await checkSoftware(web3, event.args.softwareID);

                let containerDockerID = await getDockerContainerID(web3, event.args.containerID);
                let containerAlive  = await getContainerStatus(containerDockerID);

                if (successFunds && datasetMatch[0] && softwareMatch[0] && containerAlive) {
                    console.log("-------------- ORDER VALID --------------");
                    // CREATE EXEC INSTANCE
                    let execResult = await createExecInstance(containerDockerID, softwareMatch[1], datasetMatch[1], userPubKey);

                    if (execResult[0] === "FAILURE") {
                        // TODO handle error - return money ???
                        //invalid bdb transaction id of dataset OR cannot create exec instance
                        console.log("ERROR DURING EXEC CREATE ");
                    } else {
                        let exec_id = JSON.parse(execResult[1]).Id;
                        console.log("EXEC_ID = ", exec_id);

                        //EXECUTE
                        let msg = await runExec(exec_id);

                        //TODO error handling
                        msg = msg.replace(/[\u0001\u0000\u0004]/g, "");
                        msg = msg.trim();

                        let error_codes_array = codes.getErrorCodes();

                        if (error_codes_array.includes(parseInt(msg))) {
                            let error_msg = codes.getErrorMessage(parseInt(msg));
                            //                 // await revertPayment(paymentID);
                            //                 res.send(["Failure", error_msg]);
                            // TODO handle error
                            console.log(error_msg);
                        } else {
                            //                 // await execPayment(paymentID);
                            msg = msg.replace(/\//g, ""); // remove / from ipfs address result
                            //                 res.send(["Success", msg]);
                            console.log("--------------------->", msg);
                        }
                        //         } catch (e) {
                        //             // await revertPayment(paymentID);
                        //             console.log("Returning funds...");
                        //             res.send(["Failure", "Funds returned"]);
                        //         }
                        //     });

                    }

                    latestBlock = latestBlock + 1;
                } else {
                    //TODO handle error - return full amount
                }
            }
        }
    });
}


async function createExecInstance(containerID, softwareIPFSHash, datasetIpfsHash, userPubKey) {

    console.log(containerID);
    console.log(softwareIPFSHash);
    console.log(datasetIpfsHash);
    console.log(userPubKey);


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
                    let error_codes_array = codes.getErrorCodes();

                    if (error_codes_array.includes(parseInt(status))) {
                        console.log("ERROR");
                        resolve([ERROR_STATUS, codes.getErrorMessage(parseInt(status))]);
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
    //     .then(([status, msg]) => {
    //     console.log([status, msg]);
    //     let error_codes_array = codes.getErrorCodes();
    //     if (error_codes_array.includes(parseInt(status))) {
    //         console.log("ERROR");
    //         res.send([ERROR_STATUS, codes.getErrorMessage(parseInt(status))]);
    //     } else {
    //         res.send([status, msg]);
    //     }
    //
    // });
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

async function revertPayment(paymentID) {
    let accounts = await web3.eth.getAccounts();
    let currentAccount = accounts[9];
    let PaymentContract = initContract(PaymentJSON);
    let deployedPayment = await PaymentContract.deployed();
    try {
        let success = await deployedPayment.returnFunds(paymentID, {from: currentAccount});
    } catch (e) {
        console.log(e);
    }
}

async function execPayment(paymentID) {
    let accounts = await web3.eth.getAccounts();
    let currentAccount = accounts[9];
    let PaymentContract = initContract(PaymentJSON);
    let deployedPayment = await PaymentContract.deployed();
    try {
        let success = await deployedPayment.executePayment(paymentID, {from: currentAccount});
    } catch (e) {
        console.log(e);
    }
}


async function verifyFunds(softwareID, datasetID, containerID, fundsInOrder) {
    let swCost = await getSoftwareCost(web3, softwareID);
    let dsCost = await getDatasetCost(web3, datasetID);
    let containerCost = await getContainerCost(web3, containerID);
    let expectedCost = +swCost + +dsCost + +containerCost;

    return expectedCost === fundsInOrder;

}

initWeb3();
console.log("Listening for smart contract events...");
watchEvents().then();
