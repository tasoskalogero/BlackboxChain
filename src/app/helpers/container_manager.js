// const Web3 = require("web3");
const path = require("path");
const http = require("http");
const contract = require("truffle-contract");
const driver = require("bigchaindb-driver");

const API_PATH = "http://localhost:59984/api/v1/";
const conn = new driver.Connection(API_PATH);

const ContainerRegistryJSON = require(path.join(__dirname,"../../../build/contracts/ContainerRegistry.json"));

// let web3;

// function initWeb3() {
//     console.log("Initializing web3");
//     if (typeof web3 !== "undefined") {
//         web3 = new Web3(web3.currentProvider);
//     } else {
        // set the provider you want from Web3.providers
        // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
    // }
// }
function initContract(web3, artifact) {
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

// initWeb3();


exports.getContainerCost = async function(web3, containerID) {
    let accounts = await web3.eth.getAccounts();
    let currentAccount = accounts[9];

    let ContainerRegistry = initContract(web3,ContainerRegistryJSON);
    let deployedContainerRegistry = await ContainerRegistry.deployed();
    try {
        let containerInfo = await deployedContainerRegistry.getContainerByID.call(containerID, {from: currentAccount});
        let bcdbID = containerInfo[0];
        let containerAssets = await conn.searchAssets(bcdbID);
        if (containerAssets.length === 0) {
            return false;
        }
        return containerAssets[0].data.cost;

    } catch (e) {
        console.log(e);
    }
};


exports.getDockerContainerID = async function(web3, containerID) {
    let accounts = await web3.eth.getAccounts();
    let currentAccount = accounts[9];

    let ContainerRegistry = initContract(web3, ContainerRegistryJSON);
    let deployedContainerRegistry = await ContainerRegistry.deployed();
    try {
        let containerInfo = await deployedContainerRegistry.getContainerByID.call(containerID, {from: currentAccount});
        let bcdbID = containerInfo[0];
        let containerAssets = await conn.searchAssets(bcdbID);
        if (containerAssets.length === 0) {
            return false;
        }
        return containerAssets[0].data.containerDockerID;

    } catch (e) {
        console.log(e);
    }
};

exports.getContainerStatus = function(containerDockerID) {
    let path = "/containers/" + containerDockerID + "/json";
    let options = {
        socketPath: "/var/run/docker.sock",
        path: path,
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    };
    return new Promise(resolve => {
        let req = http.request(options, function (res) {
            res.setEncoding("utf8");
            let status = res.statusCode;
            console.log("STATUS: " + status);

            let rawData = "";
            res
                .on("data", function (chunk) {
                    rawData += chunk;
                })
                .on("end", () => {
                    resolve(JSON.parse(rawData)["State"]["Status"] === 'running');
                })
                .on("error", e => {
                    console.log("ERROR", e);
                    resolve(1, "Failed to inspect container.");
                });
        });
        req.end();
    })
};