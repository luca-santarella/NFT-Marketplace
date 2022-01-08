var NFTContract = artifacts.require("./NFTCollection.sol");

module.exports = function(deployer, network, accounts) {
	if(network == "testnet" || network === "testnet") {
		deployer.deploy(NFTContract);
	}
};
