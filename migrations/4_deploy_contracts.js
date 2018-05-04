var SoftwareRegistry = artifacts.require("./SoftwareRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(SoftwareRegistry);
};
