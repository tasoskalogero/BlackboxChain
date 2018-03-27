var SoftwareRepository = artifacts.require("./SoftwareRepository.sol");

module.exports = function(deployer) {
  deployer.deploy(SoftwareRepository);
};
