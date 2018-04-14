var ContainerRegistry = artifacts.require("./ContainerRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(ContainerRegistry );
};
