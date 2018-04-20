let ContractManager = artifacts.require("./ContractManager.sol");

let OrderDb = artifacts.require("./OrderDb.sol");

module.exports = function(deployer) {
    deployer.deploy(OrderDb, ContractManager.address);
};