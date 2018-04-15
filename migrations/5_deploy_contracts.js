var Order = artifacts.require("./Order.sol");
var SoftwareRegistry = artifacts.require("./SoftwareRegistry.sol");
var ContainerRegistry = artifacts.require("./ContainerRegistry.sol");
var DatasetRegistry = artifacts.require("./DatasetRegistry.sol");


module.exports = async function(deployer) {
    deployer.deploy(Order, SoftwareRegistry.address, DatasetRegistry.address, ContainerRegistry.address);
};
