//Luca Santarella - NFT Marketplace

App = {
	contracts: {}, //store contract abstractions
	web3Provider: null, //web3 provider
	url: 'http://localhost:8545', //url for web3
	account: '0x0',  //current Ethereum account
	input: null,
	instance: null,
	isConnected: false,

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
				ethereum.enable().then(async() => {
					//Store ETH current account
					web3.eth.getCoinbase(function(err,account) {
						if(err == null) {
							App.account = account;
							console.log(account);

						}
					});
					console.log("DApp connected"); });
					App.isConnected = true;
					return App.initContract();
			}
			catch(error) { console.log(error); }
		}
		else {
			$('#upload').prop('disabled', true);
			Swal.fire({
  			icon: 'error',
  			title: 'Oops...',
  			text: 'A Web3 provider was not found',
  			footer: '<a href="https://metamask.io/download.html">Install a web3 provider such as Metamask</a>'
			})
		}

	},

	initContract: function(){

		$.getJSON('NFTCollection.json').done(function(NFTContract) {

			App.contracts["NFTCollection"] = TruffleContract(NFTContract);
			App.contracts["NFTCollection"].setProvider(App.web3Provider);
			console.log("All done!");
			return App.listenForEvents();
		});


	},

	listenForEvents: function(){
		// Retrieve contract instance
 		App.contracts["NFTCollection"].deployed().then(async(instance) =>{
			App.instance = instance;
			App.input = document.querySelector('input');
			App.input.addEventListener('change', App.createNewNFT);
			App.instance.NewMintedToken().on('data', function (event) {
				console.log("A new token has been minted!");
				console.log(event);
				alert("New token minted with tokenID: "+ event.args.tokenID);
				var fd = new FormData();
				fd.append('imageNFT', file, filename);

				$.ajax({
		  		type: "POST",
		  		url: "/upload",
		  		data: fd,
					contentType: false,
					processData: false,
					success: function(data, textStatus, jqXHR) {
						alert("Success");
					},
					error: function(jqXHR, textStatus, errorThrown) {
						alert('Error occurred!');
					},
				});
				console.log(URL.createObjectURL(file));
				location.reload(true);
			});
		});
	},

	createNewNFT: function(){

		const curFiles = App.input.files;
		file = curFiles[0];
		filename = file.name;
		App.instance.newItem(App.account, filename, {from: App.account}).then((tokenID) => {
			console.log("Successfull mint");
			console.log(tokenID);
		});
	},
}


//Call init whenever the window loads
$(function() {

	imagesArr = [];
	filenames= [];
	jQuery(document).ready(function () {
		$.ajax({
			type: "GET",
			url: "/NFT-images",
			success: function(data, textStatus, jqXHR) {
  			filenames = data.map((x) => x);
				for(i = 0; i < filenames.length; i++){ //loop through different filenames of the NFT images
					title = filenames[i].replace(/\.[^/.]+$/, "");
					imageObj = {src: filenames[i], title: title};
					imagesArr.push(imageObj);
				}
				jQuery("#nanogallery2").nanogallery2( {
					// ### gallery settings ###
					thumbnailFillWidth: "fillWidth",
					thumbnailHeight:  500,
					thumbnailWidth:   "auto",
					thumbnailLabel:     { titleFontSize: "2em" },
					itemsBaseURL:     'images/',

					// ### gallery content ###
					items: imagesArr
				});
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('Error occurred!');
			},
		});




	});
	App.init();
});
