var Order = artifacts.require("./Order.sol");

module.exports = function(deployer) {
  deployer.deploy(Order);
};
