//Luca Santarella - NFT Marketplace

App = {
	contracts: {}, //store contract abstractions
	web3Provider: null, //web3 provider
	url: 'http://localhost:8545', //url for web3
	account: '0x0',  //current Ethereum account
	input: null,

	init: function() {

		return App.initWeb3();
	},

	initWeb3: function(){
		console.log("Hello");
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
		console.log("local instance of Web3");
			App.web3Provider = new Web3.providers.HttpProvider(App.url);
			web3 = new Web3(App.web3Provider);
		}
		return App.initContract();
	},

	initContract: function(){

		//Store ETH current account
		web3.eth.getCoinbase(function(err,account) {
			if(err == null) {
				App.account = account;
				console.log(account);

			}
		});

		$.getJSON('NFTCollection.json').done(function(NFTContract) {

			App.contracts["NFT"] = TruffleContract(NFTContract);
			App.contracts["NFT"].setProvider(App.web3Provider);
			console.log("All done!");
		});

		return App.listenForEvents();
	},

	listenForEvents: function(){
		App.input = document.querySelector('input');
		App.input.addEventListener('change', App.createNewNFT);
	},

	createNewNFT: function(){
		const curFiles = App.input.files;
		file = curFiles[0];
		console.log(file);
		var fd = new FormData();
		fd.append('imageNFT', file, 'pingu.jpeg');
		console.log(fd);
		// var reader = new FileReader();
		// reader.readAsDataURL(file);
		// console.log(reader.result);
		// console.log(JSON.stringify(reader.result));
		// var formData = new FormData();
		// formData.append('fname', file.name);
		// formData.append('data', file);
		//console.log(formData);
		$.ajax({
  		type: "POST",
  		url: "/upload",
  		data: fd,
			contentType: false,
			processData: false,
			success: function(data, textStatus, jqXHR) {
				alert('Success!');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('Error occurred!');
			},
		});
		console.log(URL.createObjectURL(file));
	}
}


//Call init whenever the window loads
$(function() {
		App.init();
});
