var ResultManager = artifacts.require("./ResultManager.sol");

var ResultRegistry = artifacts.require("./ResultRegistry.sol");

module.exports = function(deployer) {
    deployer.deploy(
        ResultManager,
        ResultRegistry.address, '0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE').then(() => {

        ResultRegistry.deployed().then(inst => {
            return inst.allowAccess(ResultManager.address);
        });
    });
};