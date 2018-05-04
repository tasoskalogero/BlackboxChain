var ComputationRegistry = artifacts.require("./ComputationRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(ComputationRegistry);
};
