let ContractManager = artifacts.require("./ContractManager.sol");

var OrderManager = artifacts.require("./OrderManager.sol");

module.exports = function(deployer) {
  deployer.deploy(OrderManager, ContractManager.address);
};
