const CRTExchange = artifacts.require("CRTExchange");

module.exports = function(deployer) {
  deployer.deploy(CRTExchange);
};
