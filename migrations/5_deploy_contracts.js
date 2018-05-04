var RegistryManager = artifacts.require("./RegistryManager.sol");

var DatasetRegistry = artifacts.require("./DatasetRegistry.sol");
var SoftwareRegistry = artifacts.require("./SoftwareRegistry.sol");
var ContainerRegistry = artifacts.require("./ContainerRegistry.sol");

module.exports = function(deployer) {
    deployer.deploy(RegistryManager, DatasetRegistry.address, SoftwareRegistry.address, ContainerRegistry.address).then(() => {

        DatasetRegistry.deployed().then(inst => {
            return inst.allowAccess(RegistryManager.address);
        });

        SoftwareRegistry.deployed().then(inst => {
            return inst.allowAccess(RegistryManager.address);
        });

        ContainerRegistry.deployed().then(inst => {
            return inst.allowAccess(RegistryManager.address);
        });
    });
};