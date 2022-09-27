const Migrations = artifacts.require("Migrations");
const SupplyChain = artifacts.require("SupplyChain");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(SupplyChain);
};
