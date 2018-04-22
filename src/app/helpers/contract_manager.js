const path = require("path");
const contract = require("truffle-contract");

const ContractProviderJSON = require(path.join(__dirname,"../../../build/contracts/ContractProvider.json"));
const ContainerRegistryJSON = require(path.join(__dirname,"../../../build/contracts/ContainerRegistry.json"));
const DatasetRegistryJSON = require(path.join(__dirname,"../../../build/contracts/DatasetRegistry.json"));
const SoftwareRegistryJSON = require(path.join(__dirname,"../../../build/contracts/SoftwareRegistry.json"));
const OrderDbJSON = require(path.join(__dirname,"../../../build/contracts/OrderDb.json"));
const OrderManagerJSON = require(path.join(__dirname,"../../../build/contracts/OrderManager.json"));

exports.initContract = function (web3, artifact) {
    let MyContract = contract(artifact);
    MyContract.setProvider(web3.currentProvider);

    //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
    if (typeof MyContract.currentProvider.sendAsync !== "function") {
        MyContract.currentProvider.sendAsync = function () {
            return MyContract.currentProvider.send.apply(MyContract.currentProvider, arguments);
        };
    }
    return MyContract;
};

exports.addContracts = async function(web3, oracleAccount) {
    let ContainerRegistry = module.exports.initContract(web3, ContainerRegistryJSON);
    let deployedContainerRegistry = await ContainerRegistry.deployed();


    let DatasetRegistry = module.exports.initContract(web3, DatasetRegistryJSON);
    let deployedDatasetRegistry = await DatasetRegistry .deployed();

    let SoftwareRegistry = module.exports.initContract(web3, SoftwareRegistryJSON);
    let deployedSoftwareRegistry = await SoftwareRegistry.deployed();

    let OrderDb = module.exports.initContract(web3, OrderDbJSON);
    let deployedOrderDb = await OrderDb.deployed();

    let OrderManager = module.exports.initContract(web3, OrderManagerJSON);
    let deployedOrderManager = await OrderManager.deployed();


    let ContractProvider = module.exports.initContract(web3, ContractProviderJSON);
    let deployedContractProvider = await ContractProvider.deployed();
    await deployedContractProvider.addContract("containerReg",deployedContainerRegistry.address, {from: oracleAccount});
    await deployedContractProvider.addContract("datasetReg", deployedDatasetRegistry.address, {from: oracleAccount});
    await deployedContractProvider.addContract("softwareReg", deployedSoftwareRegistry.address, {from: oracleAccount});
    await deployedContractProvider.addContract("orderdb", deployedOrderDb.address, {from: oracleAccount});
    await deployedContractProvider.addContract("ordermanager", deployedOrderManager.address, {from: oracleAccount});
};
