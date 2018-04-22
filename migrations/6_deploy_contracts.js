let ContractProvider = artifacts.require("./ContractProvider.sol");

let OrderDb = artifacts.require("./OrderDb.sol");

module.exports = function(deployer) {
    deployer.deploy(OrderDb, ContractProvider.address);
};