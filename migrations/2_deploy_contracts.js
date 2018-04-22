var ContractProvider = artifacts.require("./ContractProvider.sol");

module.exports = function(deployer) {
  deployer.deploy(ContractProvider);
};
