var NFTContract = artifacts.require("./NFTCollection.sol");

module.exports = function(deployer, network, accounts) {
	if(network == "ropsten" || network === "rinkeby") {
		deployer.deploy(NFTContract);
	}
};
