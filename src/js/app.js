//Luca Santarella - NFT Marketplace

App = {
	contracts: {}, //store contract abstractions
	web3Provider: null, //web3 provider
	url: 'http://localhost:8545', //url for web3
	account: '0x0',  //current Ethereum account
	input: null,
	instance: null,

	init: function() {

		return App.initWeb3();
	},

	initWeb3: function(){
		/* initialize Web3 */
		if(typeof web3 != 'undefined') { //check whether exists a provider, e.g. Metamask
			App.web3Provider = window.ethereum; //standard since 2/11/18
			web3 = new Web3(App.web3Provider);
			web3.eth.net.getId().then(netId => {
				if(netId != 3){ //Ropsten testnet chain ID is 3
					$('#upload').prop('disabled', true);
					Swal.fire({
		  			icon: 'error',
		  			title: 'Warning',
		  			text: 'Please select the Ropsten testnet and reload'
					});
				}
				else{
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
							return App.initContract();
					}
					catch(error) { console.log(error); }
				}
			});
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

				title = event.args.tokenURI.replace(/\.[^/.]+$/, "");
				var fd = new FormData();
				fd.append('image', file, filename);
				fd.append('owner', event.args.userAddress);
				fd.append('id', event.args.tokenID);
				fd.append('tokenURI', event.args.tokenURI);
				fd.append('title', title);

				$.ajax({
		  		type: "POST",
		  		url: "/upload",
		  		data: fd,
					contentType: false,
					processData: false,
					success: function(data, textStatus, jqXHR) {
						console.log(textStatus);
						Swal.close();
						Swal.fire({
							title: 'Congratulations!',
							text: 'Your NFT has just been minted',
						}).then((result) => {
							if(result.isConfirmed)
								location.reload(true);
						})
					},
					error: function(jqXHR, textStatus, errorThrown) {
						alert('Error occurred!');
					},
				});

				console.log(URL.createObjectURL(file));


			});
		});
	},

	createNewNFT: function(){
		console.log("inside createNewNFT");
		const curFiles = App.input.files;
		file = curFiles[0];
		filename = file.name;

		Swal.fire({
		  title: 'Minting in progress',
			text: "The transaction could take a few minutes",
			allowEscapeKey: false,
			allowOutsideClick: false,
			didOpen: () => {
				Swal.showLoading()
			}
		})

		App.instance.newItem(App.account, filename, {from: App.account}).then((receipt) => {

			console.log("Successful mint");
			console.log(receipt);

		}).catch((error) => {
			console.log(error);
			Swal.close();
			Swal.fire({
				icon: "error",
			  title: 'Error!',
			  text: 'You need to accept the transaction to create the NFT',
			})
			App.input.value = null;
		})
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
				console.log(data);
				data.forEach(NFT => {
					imageObj = {src: NFT.tokenURI, title: NFT.title, description: "Owner: "+NFT.owner};
					imagesArr.push(imageObj);
				});
				jQuery("#nanogallery2").nanogallery2( {
					// ### gallery settings ###
					thumbnailFillWidth: "fillWidth",
					thumbnailHeight:  500,
					thumbnailWidth:   "auto",
					thumbnailLabel:     { titleFontSize: "2em", "displayDescription": true },
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
