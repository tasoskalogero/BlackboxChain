var DatasetRegistry = artifacts.require("./DatasetRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(DatasetRegistry);
};
