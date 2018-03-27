var DatasetRepository = artifacts.require("./DatasetRepository.sol");

module.exports = function(deployer) {
  deployer.deploy(DatasetRepository );
};
