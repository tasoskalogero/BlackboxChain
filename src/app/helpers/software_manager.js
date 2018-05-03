let md5 = require('md5');
const path = require("path");
const driver = require("bigchaindb-driver");

// const API_PATH = "http://localhost:59984/api/v1/";
// const conn = new driver.Connection(API_PATH);
const API_PATH = 'https://test.bigchaindb.com/api/v1/';
let conn = new driver.Connection(API_PATH, {
    app_id: 'c2c9c771',
    app_key: '28b8fde912535489c425c2e266030b0e'
});

const SoftwareRegistryJSON = require(path.join(__dirname,"../../../build/contracts/SoftwareRegistry.json"));
let contract_manager = require('./contract_manager');
let initContract = contract_manager.initContract;

// function initContract(web3, artifact) {
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

exports.getSoftwareByID = async function(web3, softwareID, oracleAccount) {
    let SoftwareRegistry = initContract(web3, SoftwareRegistryJSON);
    let deployedSoftwareRegistry = await SoftwareRegistry.deployed();
    try {
        let softwareInfo = await deployedSoftwareRegistry .getSoftwareByID.call(softwareID, {from: oracleAccount});
        let bcdbTxID = softwareInfo [0];

        let softwareAssets = await conn.searchAssets(bcdbTxID);

        if (softwareAssets.length === 0) {
            return false;
        }
        return softwareAssets[0].data;
    } catch (e) {
        console.log(e);
    }
};

exports.checkSoftware = async function(web3, softwareID, oracleAccount) {
    let SoftwareRegistry = initContract(web3, SoftwareRegistryJSON);
    let deployedSoftwareRegistry = await SoftwareRegistry.deployed();
    try {
        let softwareInfo = await deployedSoftwareRegistry .getSoftwareByID.call(softwareID, {from: oracleAccount});
        let bcdbTxID = softwareInfo [0];
        let checksum = softwareInfo [1];

        let softwareAssets = await conn.searchAssets(bcdbTxID);

        if (softwareAssets.length === 0) {
            return false;
        }
        let filename = softwareAssets[0].data.filename;
        let ipfsHash = softwareAssets[0].data.ipfsHash;
        let paramType = softwareAssets[0].data.paramType;
        let description = softwareAssets[0].data.description;
        let cost = softwareAssets[0].data.cost;

        let computedChecksum = md5(filename+ipfsHash+paramType+description+cost);
        let match = checksum === computedChecksum;
        return ([match, ipfsHash]);
    } catch (e) {
        console.log(e);
    }
};