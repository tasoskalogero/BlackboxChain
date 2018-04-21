const path = require("path");
let md5 = require('md5');
const driver = require("bigchaindb-driver");

const API_PATH = "http://localhost:59984/api/v1/";
const conn = new driver.Connection(API_PATH);

const DatasetRegistryJSON = require(path.join(__dirname,"../../../build/contracts/DatasetRegistry.json"));
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

exports.getDatasetByID = async function(web3, datasetID, oracleAccount) {
    let DatasetRegistry = initContract(web3, DatasetRegistryJSON);
    let deployedDatasetRegistry = await DatasetRegistry.deployed();
    try {
        let datasetInfo = await deployedDatasetRegistry.getDatasetByID.call(datasetID, {from: oracleAccount});
        let bcdbTxID = datasetInfo[0];
        let datasetAssets = await conn.searchAssets(bcdbTxID);

        if (datasetAssets.length === 0) {
            return false;
        }
        return datasetAssets[0].data;
    } catch (e) {
        console.log(e);
    }
};

exports.checkDataset = async function(web3, datasetID, oracleAccount) {
    let DatasetRegistry = initContract(web3, DatasetRegistryJSON);
    let deployedDatasetRegistry = await DatasetRegistry.deployed();
    try {
        let datasetInfo = await deployedDatasetRegistry.getDatasetByID.call(datasetID, {from: oracleAccount});
        let bcdbTxID = datasetInfo[0];
        let checksum = datasetInfo[1];
        let datasetAssets = await conn.searchAssets(bcdbTxID);

        if (datasetAssets.length === 0) {
            return false;
        }
        let ipfsHash = datasetAssets[0].data.ipfsHash;
        let dsName = datasetAssets[0].data.datasetName;
        let description = datasetAssets[0].data.description;
        let cost = datasetAssets[0].data.cost;

        let computedChecksum = md5(dsName+ipfsHash+description+cost);
        let match = checksum === computedChecksum;
        return ([match, ipfsHash]);
    } catch (e) {
        console.log(e);
    }
};