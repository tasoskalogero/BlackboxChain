let ContractProvider = artifacts.require("./ContractProvider.sol");

var OrderManager = artifacts.require("./OrderManager.sol");

module.exports = function(deployer) {
  deployer.deploy(OrderManager, ContractProvider.address);
};
