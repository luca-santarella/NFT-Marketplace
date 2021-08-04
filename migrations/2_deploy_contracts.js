var NFTContract = artifacts.require("./NFTCollection.sol");

module.exports = function(deployer, network, accounts) {
	if(network == "development") {
		deployer.deploy(NFTContract);
	}
};
