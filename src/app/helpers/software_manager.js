let md5 = require('md5');
const path = require("path");
const driver = require("bigchaindb-driver");

const API_PATH = 'https://test.bigchaindb.com/api/v1/';
let conn = new driver.Connection(API_PATH, {
    app_id: 'c2c9c771',
    app_key: '28b8fde912535489c425c2e266030b0e'
});

const SoftwareRegistryJSON = require(path.join(__dirname,"../../../build/contracts/SoftwareRegistry.json"));
let contract_manager = require('./contract_manager');
let initContract = contract_manager.initContract;

exports.getSoftwareByID = async function(web3, softwareID, oracleAccount) {
    let SoftwareRegistry = initContract(web3, SoftwareRegistryJSON);
    let deployedSoftwareRegistry = await SoftwareRegistry.deployed();
    try {
        console.log("------------", softwareID);
        let softwareInfo = await deployedSoftwareRegistry.getSoftwareByID.call(softwareID, {from: oracleAccount});
        let bcdbTxID = softwareInfo[0];
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
        let paramSpecs = softwareAssets[0].data.paramSpecs;
        let specification = softwareAssets[0].data.specification;
        let cost = softwareAssets[0].data.cost;

        let computedChecksum = md5(filename+ipfsHash+paramSpecs+specification+cost);
        let match = checksum === computedChecksum;
        return ([match, ipfsHash]);
    } catch (e) {
        console.log(e);
    }
};