const path = require("path");
const contract = require("truffle-contract");

const ContractManagerJSON = require(path.join(__dirname,"../../../build/contracts/ContractManager.json"));
const ContainerRegistryJSON = require(path.join(__dirname,"../../../build/contracts/ContainerRegistry.json"));
const DatasetRegistryJSON = require(path.join(__dirname,"../../../build/contracts/DatasetRegistry.json"));
const SoftwareRegistryJSON = require(path.join(__dirname,"../../../build/contracts/SoftwareRegistry.json"));
const OrderDbJSON = require(path.join(__dirname,"../../../build/contracts/OrderDb.json"));
const OrderManagerJSON = require(path.join(__dirname,"../../../build/contracts/OrderManager.json"));

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

exports.addContracts = async function(web3) {
    let accounts = await web3.eth.getAccounts();
    let currentAccount = accounts[9];

    let ContainerRegistry = initContract(web3, ContainerRegistryJSON);
    let deployedContainerRegistry = await ContainerRegistry.deployed();


    let DatasetRegistry = initContract(web3, DatasetRegistryJSON);
    let deployedDatasetRegistry = await DatasetRegistry .deployed();

    let SoftwareRegistry = initContract(web3, SoftwareRegistryJSON);
    let deployedSoftwareRegistry = await SoftwareRegistry.deployed();

    let OrderDb = initContract(web3, OrderDbJSON);
    let deployedOrderDb = await OrderDb.deployed();

    let OrderManager = initContract(web3, OrderManagerJSON);
    let deployedOrderManager = await OrderManager.deployed();




    let ContractManager = initContract(web3, ContractManagerJSON);
    let deployedContractManager = await ContractManager.deployed();
    let res1 = await deployedContractManager.addContract("containerReg",deployedContainerRegistry.address, {from: currentAccount});
    let res2 = await deployedContractManager.addContract("datasetReg", deployedDatasetRegistry.address, {from: currentAccount});
    let res3 = await deployedContractManager.addContract("softwareReg", deployedSoftwareRegistry.address, {from: currentAccount});
    let res4 = await deployedContractManager.addContract("orderdb", deployedOrderDb.address, {from: currentAccount});
    let res5 = await deployedContractManager.addContract("ordermanager", deployedOrderManager.address, {from: currentAccount});
}
