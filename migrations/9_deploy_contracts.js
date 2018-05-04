var ResultManager = artifacts.require("./ResultManager.sol");

var ResultRegistry = artifacts.require("./ResultRegistry.sol");

module.exports = function(deployer) {
    deployer.deploy(
        ResultManager,
        ResultRegistry.address).then(() => {

        ResultRegistry.deployed().then(inst => {
            return inst.allowAccess(ResultManager.address);
        });
    });
};