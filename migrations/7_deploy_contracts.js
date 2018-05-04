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
        ContainerRegistry.address).then(() => {

        ComputationRegistry.deployed().then(inst => {

            return inst.allowAccess(ComputationManager.address);
        });
    });
};