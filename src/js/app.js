//Luca Santarella - NFT Marketplace

App = {
	contracts: {}, //store contract abstractions
	web3Provider: null, //web3 provider
	url: 'http://localhost:8545', //url for web3
	account: '0x0',  //current Ethereum account


	init: function() { return App.initWeb3(); },

	initWeb3: function(){
		/* initialize Web3 */
		if(typeof web3 != 'undefined') { //check whether exists a provider, e.g. Metamask
			App.web3Provider = window.ethereum; //standard since 2/11/18
			web3 = new Web3(App.web3Provider);
			try{	//permission popup
				ethereum.enable().then(async() => { console.log("DApp connected"); });
			}
			catch(error) { console.log(error); }
		}
		else {	//otherwise, create a new local instance of Web3
			App.web3Provider = new Web3.providers.HttpProvider(App.url);
			web3 = new Web3(App.web3Provider);
		}
	},

	initContract: function(){

		//Store ETH current account
		web3.eth.getCoinbase(function(err,account) {
			if(err == null) {
				App.account = Aaccount;
				console.log(account);

			}
		});

		$.getJSON('NFT.json').done(function(NFTContract) {

			App.contracts["NFT"] = TruffleContract(NFTContract);
			App.contracts["NFT"].setProvider(App.web3Provider);
			console.log("All done!");
		});
	}
}

//Call init whenever the window loads
$(function() {
	$(window).on('load', function () {
		App.init();
	});
});
