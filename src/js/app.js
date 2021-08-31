//Luca Santarella - NFT Marketplace

App = {
	contracts: {}, //store contract abstractions
	web3Provider: null, //web3 provider
	account: '0x0',  //current Ethereum account
	input: null,  //TODO
	instance: null, //instance of the smart contract (already deployed)
	itemsNFTGallery: [],

	initGallery: function(){
		jQuery(document).ready(function () {
			$.ajax({
				type: "GET",
				url: "/NFT-images",
				success: function(data, textStatus, jqXHR) {
					data.forEach(NFT => {
						minOwner = NFT.owner.slice(0,5) + '...' + NFT.owner.slice(-5);
						imageObj = {src: NFT.tokenURI, title: NFT.title, description: "Token ID: "+NFT.id+" Owner: "+NFT.owner, tokenID: NFT.id, owner: NFT.owner, divElement: null};
						App.itemsNFTGallery.push(imageObj);
					});
					jQuery("#nanogallery2").nanogallery2( {
						// ### gallery settings ###
						thumbnailFillWidth: "fillWidth",
						thumbnailHeight:  '200 XS250 LA250 XL350',
						thumbnailWidth:   "300 XS350 LA400 XL500",
						thumbnailLabel:     { titleFontSize: "15px" },
						galleryL1FilterTags: true,
						itemsBaseURL:     'images/',
						viewerTools:    {
        			topLeft:    'label',
        			topRight:   'rotateLeft, rotateRight, fullscreenButton, closeButton'
      			},
						thumbnailGutterHeight: 100,

						// ### callback for loading thumbnail ###
						fnThumbnailInit: function($thumbnail, item, GOMidx){App.addLowerToolbar($thumbnail, item, GOMidx);},
						// ### gallery content ###
						items: App.itemsNFTGallery
					});
				},
				error: function(jqXHR, textStatus, errorThrown) {
					alert('Error occurred!');
				},
			});

		});
	},

	addLowerToolbar: function($thumbnail, item, GOMidx){
		$thumbnail.css({ "overflow": "visible", "height": "100%", "width": "100%" });
		var lowerToolbar = $("<div>")
			.addClass('lowerToolbar d-flex')
			.text('')
			.appendTo($thumbnail)
			.on('mousedown', function(e){e.stopPropagation();})
			.on('touchstart', function(e){e.stopPropagation();})
			.on('touchdown', function(e){e.stopPropagation();});

		var lowerToolbarText = $("<div>")
				.addClass('lowerToolbarText')
				.appendTo(lowerToolbar)
				.css({'width':'100%'});

		$("<p>")
				.text(item.description)
				.appendTo(lowerToolbarText);


		App.itemsNFTGallery.forEach(function(itemArr) {
			if(itemArr.title === item.title){
				itemArr.divElement = $thumbnail;

				//user has already connected before image was loaded
				if(App.account != '0x0' && App.account === itemArr.owner.toLowerCase()){
					console.log("user has already connected");
					lowerToolbarText.css({'width':'70%'});
					App.addDeleteBtn(lowerToolbar, itemArr);
				}
			}
		});


	},

	init: function() {
		var isConnected = sessionStorage.getItem('isConnected');

		if (isConnected)
			return App.initWeb3();

		$('input').on('click', function(event){
			event.preventDefault();
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Please connect your wallet with Metamask first',
			})
		});
		$('#connectBtn').on('click',App.initWeb3);
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
					$('#upload').prop('disabled', false);
					try{	//permission popup
						ethereum.enable().then(async() => {
							//Store ETH current account
							web3.eth.getCoinbase(function(err,account) {
								if(err == null) {
									$('#connectBtn').text("Connected ✓");
									$('#connectBtn').prop('disabled', true);
									$('input').off();
									$('#connectBtn').off();
									App.account = account;
									console.log("account: "+account);
									App.itemsNFTGallery.forEach(function(itemObj) {
										console.log(itemObj);
										if(itemObj.divElement != null && account === itemObj.owner.toLowerCase()){
											console.log("inside");
											lowerToolbarText = itemObj.divElement.find('.lowerToolbarText');
											lowerToolbarText.css({'width':'70%'});

											lowerToolbar= itemObj.divElement.find('.lowerToolbar');
											App.addDeleteBtn(lowerToolbar, itemObj);
										}
									});
									//console.log(account);
								}
							});
							console.log("DApp connected"); });
							sessionStorage.setItem('isConnected', true);

							return App.initContract();
					}
					catch(error) { console.log(error); }
				}
			});
		}
		else {
			Swal.fire({
  			icon: 'error',
  			title: 'Oops...',
  			text: 'A Web3 provider was not found',
  			footer: '<a href="https://metamask.io/download.html">Install a web3 provider such as Metamask</a>'
			})
		}

	},

	addDeleteBtn: function(lowerToolbar, item){

		var lowerToolbarBtn = $("<div>")
			.addClass('lowerToolbarBtn d-flex justify-content-end')
			.appendTo(lowerToolbar)
			.on('click', function(){App.deleteNFT(item)});

		$("<button>")
			.addClass('btn btn-outline-danger btn-sm')
			.text("DELETE")
			.appendTo(lowerToolbarBtn);
	},

	initContract: function(){

		//Init contracts getting the ABI
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

			window.ethereum.on('accountsChanged', function (accounts) {
  			console.log("new account is: "+accounts);
				//TODO
			})

			$('input').on('change', App.createNFT);

			App.instance.mintedToken().on('data', function(event){
				App.uploadImg(event);
			});

			App.instance.burnedToken().on('data', function(event){
				App.deleteImg(event);
			});
		});
	},

	createNFT: function(){
		App.input = document.querySelector('input');
		const curFiles = App.input.files;
		file = curFiles[0];
		filename = file.name;

		Swal.fire({
		  title: 'Minting in progress',
			text: "The transaction could take several seconds",
			allowEscapeKey: false,
			allowOutsideClick: false,
			didOpen: () => {
				Swal.showLoading()
			}
		})

		App.instance.mintToken(App.account, filename, {from: App.account}).then((receipt) => {

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

	deleteNFT: function(item){
		Swal.fire({
		  title: 'Are you sure?',
		  text: "You won't be able to revert this!",
		  icon: 'warning',
		  showCancelButton: true,
		  confirmButtonColor: '#3085d6',
		  cancelButtonColor: '#d33',
		  confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
		  if (result.isConfirmed) {
				Swal.fire({
				  title: 'Burning &#x1f525; in progress',
					text: "The transaction could take several seconds",
					allowEscapeKey: false,
					allowOutsideClick: false,
					didOpen: () => {
						Swal.showLoading()
					}
				})

				console.log(item.tokenID);
				App.instance.burnToken(item.tokenID, {from: App.account})
				.then((receipt) => {
					console.log(receipt);
					Swal.fire(
				  	'Deleted!',
				  	'Your file has been deleted.',
				    'success'
				  );
				}).catch(function(err){
					if(err.code === 4001){
						Swal.fire({
							icon: "error",
							title: 'Error!',
							text: "Please accept the transaction",
						});
					}
					else{
						Swal.fire({
							icon: "error",
							title: 'Error!',
							text: err.code,
						});
					}
				});
			}
		})
	},

	uploadImg: function (event) {
		console.log("A new token has been minted!");
		console.log(event);

		//remove extension from filename
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
				Swal.fire({
					icon: "error",
					title: 'Error!',
					text: "Something went wrong..",
				});
			},
		});

		console.log(URL.createObjectURL(file));
	},

	deleteImg: function (event) {
		console.log("A token has been burned!");

		title = event.args.tokenURI.replace(/\.[^/.]+$/, "");
		jsonData = JSON.stringify({id: event.args.tokenID,
			tokenURI: event.args.tokenURI});

		$.ajax({
  		type: "POST",
  		url: "/delete",
			dataType: "json",
			contentType: "application/json",
  		data: jsonData,
			success: function(data, textStatus, jqXHR) {
				console.log(textStatus);
				Swal.close();
				Swal.fire({
					title: 'Congratulations!',
					text: 'Your NFT has just been deleted',
				}).then((result) => {
					if(result.isConfirmed)
						location.reload(true);
				})
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus);
				console.log(errorThrown);
				alert('Something went wrong!');
			},
		});
	}
}


//Call init whenever the window loads
$(function() {
	App.initGallery();
	App.init();
});
