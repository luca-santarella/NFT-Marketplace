//Luca Santarella - NFT Marketplace

App = {
	contracts: {}, //store contract abstractions
	web3: null,
	web3Modal: null,
	web3Provider: null, //web3 provider
	account: '0x0',  //current Ethereum account
	//smart contract address
	contractAddress:'0xAC6d1527F211Bc231C6d8a2BAcD34FCe6b3ee10b',
	instance: null, //instance of the smart contract (already deployed)
	itemsNFTGallery: [],

	initGallery: function(){
		jQuery(document).ready(function () {
			$.ajax({
				type: "GET",
				url: "/NFT-images",
				//create array of objs for the gallery
				success: function(data, textStatus, jqXHR) {
					data.forEach(NFT => {
						imageObj = {src: NFT.tokenURI, title: NFT.title, id: NFT.id,
												description: "Token ID: "+NFT.id+" Owner: "+NFT.owner,
												tokenID: NFT.id, owner: NFT.owner, divElement: null,
												txHash: NFT.txHash};
						App.itemsNFTGallery.push(imageObj);
					});
					jQuery("#nanogallery2").nanogallery2( {
						// ### gallery settings ###
						thumbnailFillWidth: "fillWidth",
						thumbnailHeight:  '300 XS300 LA400 XL400',
						thumbnailWidth:   "350 XS400 LA500 XL500",
						thumbnailLabel:     { titleFontSize: "20px" },
						galleryL1FilterTags: true,
						itemsBaseURL:     '/images/',
						viewerTools:    {
        			topLeft:    'label',
        			topRight:   'rotateLeft, rotateRight, fullscreenButton, closeButton'
      			},
						thumbnailGutterHeight: 125,
						gallerySorting: 'idAsc',
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
			//avoid defaul behaviour from gallery
			.on('mousedown', function(e){e.stopPropagation();})
			.on('touchstart', function(e){e.stopPropagation();})
			.on('touchdown', function(e){e.stopPropagation();});

		var lowerToolbarText = $("<div>")
			.addClass('lowerToolbarText')
			.appendTo(lowerToolbar)
			.css({'width':'100%'});


		itemArr = App.itemsNFTGallery.find(x => x.title === item.title);

		itemArr.divElement = $thumbnail;

		$("<div>")
			.text("Token ID: "+itemArr.id)
			.appendTo(lowerToolbarText);

		var minOwner = itemArr.owner.substring(0,4) + "..." + itemArr.owner.slice(-4);
		$("<div>")
			.text("Owner: "+minOwner)
			.appendTo(lowerToolbarText);

		var txEtherscan = "https://ropsten.etherscan.io/tx/"+itemArr.txHash;
		$("<div>")
			.html('Tx: <a href="'+txEtherscan+'">Check on Etherscan</a>')
			.appendTo(lowerToolbarText);

		//user has already connected before image was loaded
		if(App.account != '0x0' && App.account === itemArr.owner.toLowerCase()){
			lowerToolbarText.css({'width':'70%'});
			App.addDeleteBtn(lowerToolbar, itemArr);
		}


	},

	init: function() {

		var isConnected = sessionStorage.getItem('isConnected');

		if (isConnected){
			return App.initWeb3();
		}

		$('input').on('click', function(event){
			event.preventDefault();
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Please connect your wallet with Metamask first',
				showConfirmButton:true,
				confirmButtonColor: '#e27d5f',
			})
		});
		$('#connectBtn').on('click',App.initWeb3);
	},

	initWeb3: async function(){

		const Web3Modal = window.Web3Modal.default;
		const WalletConnectProvider = window.WalletConnectProvider.default;

		// Web3modal instance
		App.web3Modal;

		const providerOptions = {
	    walletconnect: {
	      package: WalletConnectProvider,
	      options: {
	        infuraId: "a4de77d4c2894e2387ff4432d935587e0",
	      }
	    },
		};

		App.web3Modal = new Web3Modal({
	    cacheProvider: true,
	    providerOptions,
	    disableInjectedProvider: false,
	  });

		provider = await detectEthereumProvider();

		if(provider){
			console.log("Web3 provider detected");
			App.web3Provider = provider;
		}
		else{
			console.log("Web3provider not detected");
			try {
				App.web3Provider = await App.web3Modal.connect();
			}
			catch(err) {
				console.log(err);
				if(err==="Modal closed by user"){
					Swal.fire({
						icon: 'error',
						title: 'Oops...',
						text: 'A Web3 provider was not selected',
						showConfirmButton:true,
						confirmButtonColor: '#e27d5f',
					})
				}
				else{
					Swal.fire({
						icon: 'error',
						title: 'Oops...',
						text: 'A Web3 provider was not found',
						showConfirmButton:true,
						confirmButtonColor: '#e27d5f',
						footer: '<a href="https://metamask.io/download.html">Install a web3 provider such as Metamask</a>'
					})
				}
			}
		}
		App.web3 = new Web3(App.web3Provider);
		// Get connected chain id from Ethereum node
	  const netId = await App.web3.eth.getChainId();
		console.log(netId);
		if(netId != 3){ //Ropsten testnet chain ID is 3
			$('#upload').prop('disabled', true);
			Swal.fire({
  			icon: 'error',
  			title: 'Warning',
  			text: 'Please select the Ropsten testnet',
				showConfirmButton:true,
				confirmButtonColor: '#e27d5f',
			});
			// Close provider session
			await App.web3Provider.disconnect()
			return App.init();
		}
		else{

			try{	//permission popup
				App.web3.eth.requestAccounts().then(function(){
					//Store ETH current account
					App.web3.eth.getCoinbase(function(err,account) {
						if(err == null) {
							$('#connectBtnText').text("Connected");
							$('.fa-wallet').css('display', 'none');
							$('#connectBtn')
								.prop('disabled', true)
								.append('<i class="fas fa-link"></i>');
							$('input').off();
							$('input').on('change', App.createNFT);
							$('#connectBtn').off();
							$('#upload').prop('disabled', false);
							App.account = account;
							console.log("account: "+account);
							App.itemsNFTGallery.forEach(function(itemObj) {
								if(itemObj.divElement != null && account === itemObj.owner.toLowerCase()){
									lowerToolbarText = itemObj.divElement.find('.lowerToolbarText');
									lowerToolbarText.css({'width':'70%'});

									lowerToolbar= itemObj.divElement.find('.lowerToolbar');
									App.addDeleteBtn(lowerToolbar, itemObj);
								}
							});
						}
					});
					console.log("DApp connected");
					sessionStorage.setItem('isConnected', true);
					return App.initContract();
				})
				.catch(function(error){
					if(error.code === -32002){
						Swal.fire({
							icon: 'warning',
							title: 'Connection already open',
							text: 'Please connect with your wallet',
							showConfirmButton:true,
							confirmButtonColor: '#e27d5f',
						});
					}
					console.log(error);
				});
			}
			catch(error) { console.log(error); }
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
			App.web3.eth.Contract.setProvider(App.web3Provider);
			App.instance = new App.web3.eth.Contract(NFTContract.abi,App.contractAddress);
			console.log("All done!");
			return App.listenForEvents();
		});


	},

	listenForEvents: function(){
		window.ethereum.on('accountsChanged', function (accounts) {
			console.log("new account is: "+accounts);
			//TODO
		})

		$('input').on('change', App.createNFT);

		App.instance.events.mintedToken().on('data', function(event){
			App.uploadImg(event);
		});

		App.instance.events.burnedToken().on('data', function(event){
			App.deleteImg(event);
		});
	},

	createNFT: function(){
		var input = document.querySelector('input');
		const curFiles = input.files;
		file = curFiles[0];
		filename = file.name;
		var title = '';
		Swal.fire({
		  title: 'Enter a name for your NFT',
		  input: 'text',
		  inputAttributes: {
		    autocapitalize: 'off'
		  },
		  showCancelButton: true,
		  confirmButtonText: 'Submit',
			showConfirmButton:true,
			confirmButtonColor: '#e27d5f',
		  showLoaderOnConfirm: true,
		  preConfirm: (inputTitle) => {
				return $.ajax({
					type: "GET",
					url: "/item-name",
					dataType: "json",
					data: "title="+inputTitle,
					success: function(data, textStatus, jqXHR) {
						if(data != null){
							Swal.showValidationMessage(
								`This title already exists, please choose another one.`
							);
							return "error";
						}

					},
					error: function(jqXHR, textStatus, errorThrown) {
						title = inputTitle;
					},
				})
				.catch(function(){App.mintToken(filename, title);})
		  },
		  allowOutsideClick: () => false
		}).then((result) => {
			console.log(result);
		  if (result.isConfirmed) {
				Swal.fire({
					icon: 'warning',
				  title: 'Confirm transaction',
					timer: 20000,
					text: "Please confirm the transaction with your wallet",
				})
		  }
		})
		.catch((error) =>{
			Swal.close();
			console.log(error);
		})

	},

	mintToken: function(filename, title){
		gasPrice = 1999999990; //almost 2 Gwei as default
		App.web3.eth.getGasPrice(function(error, result){
			console.log(result);
			gasPrice = result;
		});
		//get encoded transaction with params
		var data = App.instance.methods.mintToken(App.account, filename, title).encodeABI();
		//send data to Ethereum blockchain (gasPrice is set automatically with web3.eth.estimateGas)
		App.web3.eth.sendTransaction({
			from: App.account,
			to: App.contractAddress,
			data: data,
			gasPrice: gasPrice
		}).on('transactionHash', (hash) =>{
			console.log(hash);
			Swal.close();
			Swal.fire({
				title: 'Minting in progress',
				text: "The transaction could take several seconds",
				allowEscapeKey: false,
				allowOutsideClick: false,
				timer: 180000,
				didOpen: () => {
					Swal.showLoading()
				}

			}).then((result) => {
				if (result.dismiss === Swal.DismissReason.timer) {
					Swal.fire({
						icon: "error",
						title: 'Error!',
						text: 'Something went wrong while minting this token, please retry.',
						showConfirmButton:true,
						confirmButtonColor: '#e27d5f',
					})
				}
			})
		}).then((receipt) => {
			console.log("Successful mint");
			console.log(receipt);
		}).catch((error) => {
			console.log(error);
			Swal.close();
			if(error.code === 4001){
				Swal.fire({
					icon: "error",
					title: 'Error!',
					text: 'You need to accept the transaction to create the NFT',
					showConfirmButton:true,
					confirmButtonColor: '#e27d5f',
				})
				input.value = null;
				}
			})
	},

	deleteNFT: function(item){
		Swal.fire({
		  title: 'Are you sure?',
		  text: "You won't be able to revert this!",
		  icon: 'warning',
		  showCancelButton: true,
			showConfirmButton:true,
			confirmButtonColor: '#e27d5f',
		  confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
		  if (result.isConfirmed) {
				Swal.fire({
					icon: 'warning',
				  title: 'Burning &#x1f525; in progress',
					text: "The transaction could take several seconds",
					allowEscapeKey: false,
					allowOutsideClick: false,
					didOpen: () => {
						Swal.showLoading()
					}
				})
				App.burnToken(item.tokenID);
			}
		})
	},

	burnToken: function(tokenID){
		gasPrice = 1999999990; //almost 2 Gwei as default
		App.web3.eth.getGasPrice(function(error, result){
			console.log(result);
			gasPrice = result;
		});

		//get encoded transaction with params
		var data = App.instance.methods.burnToken(tokenID).encodeABI();
		App.web3.eth.sendTransaction({
			from: App.account,
			to: App.contractAddress,
			data: data,
			gasPrice: gasPrice
		}).then((receipt) => {
			console.log(receipt);
			console.log("NFT was burned");
		}).catch(function(err){
			if(err.code === 4001){
				Swal.fire({
					icon: "error",
					title: 'Error!',
					text: "Please accept the transaction",
					showConfirmButton:true,
					confirmButtonColor: '#e27d5f',
				});
			}
			else{
				Swal.fire({
					icon: "error",
					title: 'Error!',
					text: err.code,
					showConfirmButton:true,
					confirmButtonColor: '#e27d5f',
				});
			}
		});
	},

	uploadImg: function (event) {
		console.log("A new token has been minted!");
		console.log(event);

		var fd = new FormData();
		fd.append('image', file, filename);
		fd.append('owner', event.returnValues.userAddress);
		fd.append('id', event.returnValues.tokenID);
		fd.append('tokenURI', event.returnValues.tokenURI);
		fd.append('title', event.returnValues.title);
		fd.append('txHash', event.transactionHash);

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
					showConfirmButton:true,
					confirmButtonColor: '#e27d5f',
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
					showConfirmButton:true,
					confirmButtonColor: '#e27d5f',
				});
			},
		});

		console.log(URL.createObjectURL(file));
	},

	deleteImg: function (event) {
		console.log("A token has been burned!");

		jsonData = JSON.stringify(
			{id: event.returnValues.tokenID,
				tokenURI: event.returnValues.tokenURI,
				title: event.returnValues.titles
			}
		);

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
					icon: 'success',
					title: 'Congratulations!',
					text: 'Your NFT has just been deleted',
					showConfirmButton:true,
					confirmButtonColor: '#e27d5f',
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
