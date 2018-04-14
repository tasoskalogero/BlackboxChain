var DatasetRepository = artifacts.require("./DatasetRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(DatasetRepository );
};
