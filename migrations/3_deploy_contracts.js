var ContainerRepository = artifacts.require("./ContainerRepository.sol");

module.exports = function(deployer) {
  deployer.deploy(ContainerRepository );
};
