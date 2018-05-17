var ComputationManager = artifacts.require("./ComputationManager.sol");

var ComputationRegistry = artifacts.require("./ComputationRegistry.sol");
var DatasetRegistry = artifacts.require("./DatasetRegistry.sol");
var SoftwareRegistry = artifacts.require("./SoftwareRegistry.sol");
var ContainerRegistry = artifacts.require("./ContainerRegistry.sol");

module.exports = function(deployer) {
    deployer.deploy(
        ComputationManager,
        ComputationRegistry.address,
        DatasetRegistry.address,
        SoftwareRegistry.address,
        ContainerRegistry.address,
        '0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE').then(() => {

        ComputationRegistry.deployed().then(inst => {

            return inst.allowAccess(ComputationManager.address);
        });
    });
};