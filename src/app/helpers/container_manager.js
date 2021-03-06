const path = require("path");
const http = require("http");
const driver = require("bigchaindb-driver");

const API_PATH = 'https://test.bigchaindb.com/api/v1/';
let conn = new driver.Connection(API_PATH, {
    app_id: 'c2c9c771',
    app_key: '28b8fde912535489c425c2e266030b0e'
});

const ContainerRegistryJSON = require(path.join(__dirname,"../../../build/contracts/ContainerRegistry.json"));
let contract_manager = require('./contract_manager');
let initContract = contract_manager.initContract;

exports.getContainerByID = async function(web3, containerID, oracleAccount) {

    let ContainerRegistry = initContract(web3,ContainerRegistryJSON);
    let deployedContainerRegistry = await ContainerRegistry.deployed();
    try {
        let containerInfo = await deployedContainerRegistry.getContainerByID.call(containerID, {from: oracleAccount});
        let bcdbTxID = containerInfo[0];
        let containerAssets = await conn.searchAssets(bcdbTxID);
        if (containerAssets.length === 0) {
            return false;
        }
        return containerAssets[0].data;

    } catch (e) {
        console.log(e);
    }
};


exports.getDockerContainerID = async function(web3, containerID, oracleAccount) {

    let ContainerRegistry = initContract(web3, ContainerRegistryJSON);
    let deployedContainerRegistry = await ContainerRegistry.deployed();
    try {
        let containerInfo = await deployedContainerRegistry.getContainerByID.call(containerID, {from: oracleAccount});
        let bcdbTxID = containerInfo[0];
        let containerAssets = await conn.searchAssets(bcdbTxID);
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