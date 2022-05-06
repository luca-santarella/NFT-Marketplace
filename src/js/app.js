//Luca Santarella - NFT Marketplace

App = {
	contracts: {}, //store contract abstractions
	web3: null,
	web3Modal: null,
	web3Provider: null, //web3 provider
	account: '0x0',  //current Ethereum account
	//smart contract address
	contractAddress: '0x5Fc25f00fc0413CCCbca3aC200D30285641c0803', //'0x29e345B7855BAE6a21C1701D23eab4A9ba0FAE4b',
	instance: null, //instance of the smart contract (already deployed)
	itemsNFTGallery: [],
	isWalletConnect: false,


	initGallery: function(){
		///check if gallery has been already initialized
		// if ($("#nanogallery2").children().length > 0 ) {
		// 	console.log("already init");
		// 	$.ajax({
		// 		type: "GET",
		// 		url: "/NFT-images",
		// 		//create array of objs for the gallery
		// 		success: function(data, textStatus, jqXHR) {
		// 			data.forEach(NFT => {
		// 				imageObj = {src: NFT.tokenURI, title: NFT.title, id: NFT.id,
		// 										description: "Token ID: "+NFT.id+" Owner: "+NFT.owner,
		// 										tokenID: NFT.id, owner: NFT.owner, divElement: null,
		// 										txHash: NFT.txHash};
		// 				App.itemsNFTGallery.push(imageObj);
		// 			});
		// 			console.log("drawing..");
		// 			$('#nanogallery2').nanogallery2('data').gallery.items = App.itemsNFTGallery;
		// 			$('#nanogallery2').nanogallery2('refresh');
		// 		},
		// 		error: function(jqXHR, textStatus, errorThrown) {
		// 			alert('Error occurred!');
		// 		},
		// 	});
		//
		// }
		// else {
		$.ajax({
			type: "GET",
			url: "/items",
			//create array of objs for the gallery
			success: function(data, textStatus, jqXHR) {
				data.forEach(NFT => {
					imageObj = {src: NFT.tokenURI, title: NFT.title, id: NFT.id,
											description: "Token ID: "+NFT.id+" Owner: "+NFT.owner,
											tokenID: NFT.id, owner: NFT.owner, divElement: null,
											txHash: NFT.txHash};
					App.itemsNFTGallery.push(imageObj);
				});
				console.log("drawing..");
				$("#nanogallery2").nanogallery2( {
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
	//}
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

		//search element with title as item.title
		itemArr = App.itemsNFTGallery.find(x => x.title === item.title);

		itemArr.divElement = $thumbnail;

		$("<div>")
			.text("Token ID: "+itemArr.id)
			.appendTo(lowerToolbarText);

		var minOwner = App.minimizeAddress(itemArr.owner);
		$("<div>")
			.text("Owner: "+minOwner)
			.appendTo(lowerToolbarText);

		var txEtherscan = "https://testnet.bscscan.com/tx/"+itemArr.txHash;
		$("<div>")
			.html('Tx: <a href="'+txEtherscan+'" target="_blank">Check on BSCscan</a>')
			.appendTo(lowerToolbarText);

		//user has already connected before image was loaded
		if(App.account != '0x0' && App.account === itemArr.owner.toLowerCase()){
			lowerToolbarText.css({'width':'70%'});
			App.addDeleteBtn(lowerToolbar, itemArr);
		}


	},

	init: function() {

		var isConnected = sessionStorage.getItem('isConnected');
		if (isConnected === "true"){
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
					rpc: {
						97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
						// ...
					},
					qrcodeModalOptions: {
				    		mobileLinks: [
				      		"rainbow",
				      		"argent",
				     		 "trust",
				     		 "imtoken",
				     		 "pillar",
				    		],
				  	},
	        //infuraId: "a4de77d4c2894e2387ff4432d935587e", //TODO
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
				App.isWalletConnect = true;
			}
			catch(err) {
				console.log(err);
				Swal.fire({
					icon: 'error',
					title: 'Oops...',
					text: 'A Web3 provider was not selected',
					showConfirmButton:true,
					confirmButtonColor: '#e27d5f',
					footer: '<a href="https://metamask.io/download.html">Install a web3 provider such as Metamask</a>'
				})
			}
		}
		App.web3 = new Web3(App.web3Provider);
		// Get connected chain id from Ethereum node
	  const netId = await App.web3.eth.getChainId();
		console.log(netId);
		if(netId != 97){ //BSC testnet chain ID is 97
			$('#upload').prop('disabled', true);
			Swal.fire({
  			icon: 'error',
  			title: 'Warning',
  			text: 'Please select the BSC testnet',
				showConfirmButton:true,
				confirmButtonColor: '#e27d5f',
			});
			// Close provider session
			if(App.isWalletConnect)
				await App.web3Provider.disconnect();
			sessionStorage.setItem('isConnected', false);
		}
		else{

			try{
				App.web3.eth.requestAccounts().then(function(){
					//Store ETH current account
					App.web3.eth.getCoinbase(function(err,account) {
						if(err == null) {
							App.account = account;
							const minAddress = App.minimizeAddress(account);
							$('#connectBtnText').text(minAddress);
							$('.fa-wallet').css('display', 'none');
							if($('#connectBtn').children().length < 3 ){
								$('#connectBtn')
									//.prop('disabled', true)
									.append('<i class="fas fa-link"></i>');
							}
							$('input').off();
							$('input').on('change', App.createNFT);
							console.log("disabling connect btn");
							$('#connectBtn').on('click',App.disconnectAccount);
							$('#upload').prop('disabled', false);
							console.log("account: "+account);
							App.itemsNFTGallery.forEach(function(itemObj) {
								if(itemObj.divElement != null && account.toLowerCase() === itemObj.owner.toLowerCase()){
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

	disconnectAccount: async function(){
		//TODO: check all resets
		sessionStorage.setItem('isConnected', false);
		App.account = '0x0';
		if(App.isWalletConnect)
		await App.web3Provider.disconnect();
		console.log("account disconnected");
		location.reload(true);
	},

	initContract: function(){

		//Init contracts getting the ABI
		$.getJSON('NFTCollection.json').done(function(NFTContract) {
			//App.web3.eth.Contract.setProvider(App.web3Provider);
			App.instance = new App.web3.eth.Contract(NFTContract.abi,App.contractAddress);
			return App.listenForEvents();
		});


	},

	listenForEvents: function(){
		window.ethereum.on('accountsChanged', function (accounts) {
			console.log("new account is: "+accounts);
			window.location.reload();
			// App.account = accounts;
			// App.web3 = null;
			// App.web3Provider = null;
			// App.web3Modal = null;
			// App.initGallery();
			// App.init();
		})

		window.ethereum.on('chainChanged', (chainId) => window.location.reload());

		$('input').on('change', App.createNFT);

		// App.instance.events.mintedToken().on('data', function(event){
		// 	console.log("received event mintedToken");
		// 	App.uploadImg(event);
		// });
		//
		// App.instance.events.burnedToken().on('data', function(event){
		// 	App.deleteImg(event);
		// });
	},

	createNFT: function(){
		var input = document.querySelector('input');
		const curFiles = input.files;
		file = curFiles[0];
		filename = file.name;
		var title = '';
		var tokenURI = '';
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
					url: "/items/item",
					dataType: "json",
					data: "title="+inputTitle,
					success: function(data, textStatus, jqXHR) {
						if(data != null){ //TODO reengineer it
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
				.catch(function(){
					var fd = new FormData();
					fd.append('image', file, filename);
					fd.append('owner', App.account);
					fd.append('title', title);

					$.ajax({
						type: "POST",
						url: "/items/metadata",
						data: fd,
						contentType: false,
						processData: false,
						success: function(data, textStatus, jqXHR) {
							console.log(textStatus);
							console.log(data);
							tokenURI = "https://ipfs.io/ipfs/"+data; //IPFS hash of the metadata of the token
							App.mintToken(title, tokenURI);
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
				})
		  },
		  //allowOutsideClick: () => false
		}).then((result) => {
		  if (result.isConfirmed) {
				console.log("result is confirmed");
				Swal.fire({
					icon: 'info',
				  title: 'Confirm transaction',
					timer: 5000,
					text: "Please confirm the transaction with your wallet",
					showConfirmButton: false,
				})
		  }
		})
		.catch((error) =>{
			Swal.close();
			console.log(error);
		})

	},

	mintToken: async function(title, tokenURI){
		//default gasLimit
		const gasLimit = 250000;
		//get gas price (determined by the last few blocks median gas price)
		const gasPrice = await App.web3.eth.getGasPrice();

		//estimate gas needed for transaction
		const gas = await App.instance.methods.mintToken(App.account, title, tokenURI).estimateGas({
			from: App.account,
			gas: gasLimit
		});
		console.log(gas);

		//get encoded transaction with params
		//var data = App.instance.methods.mintToken(App.account, title, tokenURI).encodeABI();

		//send data to Ethereum blockchain (gasPrice are not set automatically because of issues with walletconnect)
		App.instance.methods.mintToken(App.account, title, tokenURI).send({
			from: App.account,
			gasPrice: gasPrice,
			gas:gas,
		}).on('transactionHash', (hash) => {
			Swal.close();
			console.log("got transaction hash");
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
			App.waitForReceipt(hash, function (receipt) {
    		Swal.close();
				inputs = [
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "tokenID",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "address",
						"name": "userAddress",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "bytes32",
						"name": "tokenURI",
						"type": "bytes32"
					},
					{
						"indexed": false,
						"internalType": "string",
						"name": "title",
						"type": "string"
					}
				];
				console.log("receipt received");
				var transactionHash = receipt.transactionHash;
				var data = receipt.logs[1].data;
				console.log(data);
				var encodedLogs = receipt.logs[0].topics;
				var decodedLogs = App.web3.eth.abi.decodeLog(inputs, data, encodedLogs);
				App.uploadImg(decodedLogs.userAddress, decodedLogs.tokenID,
					 decodedLogs.tokenURI, decodedLogs.title, transactionHash);
  		})

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
					icon: 'info',
				  title: 'Confirm transaction',
					timer: 2000,
					text: "Please confirm the transaction with your wallet",
					showConfirmButton: false,
				})
				App.burnToken(item.tokenID);
			}
		})
	},

	burnToken: async function(tokenID){
		//default gasLimit
		const gasLimit = 100000;
		//get gas price (determined by the last few blocks median gas price)
		const gasPrice = await App.web3.eth.getGasPrice();
		console.log(gasPrice);
		//estimate gas needed for transaction
		const gas = await App.instance.methods.burnToken(tokenID).estimateGas({
			from: App.account,
			gas: gasLimit
		});
		console.log(gas);

		//get encoded transaction with params
		//var data = App.instance.methods.burnToken(tokenID).encodeABI();
		//console.log(data);
		//send data to Ethereum blockchain (gasPrice are not set automatically because of issues with walletconnect)
		App.instance.methods.burnToken(tokenID).send({
			from: App.account,
			gasPrice: gasPrice,
			gas: gas,
		}).on('transactionHash', (hash) => {
			Swal.close();
			Swal.fire({
				title: 'Burning &#x1f525; in progress',
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
			App.waitForReceipt(hash, function (receipt) {
				Swal.close();
				inputs = [
	        {
	          "indexed": false,
	          "internalType": "uint256",
	          "name": "tokenID",
	          "type": "uint256"
	        },
	        {
	          "indexed": false,
	          "internalType": "address",
	          "name": "userAddress",
	          "type": "address"
	        },
	        {
	          "indexed": false,
	          "internalType": "bytes32",
	          "name": "tokenURI",
	          "type": "bytes32"
	        },
	        {
	          "indexed": false,
	          "internalType": "string",
	          "name": "title",
	          "type": "string"
	        }
	      ];
				var transactionHash = receipt.transactionHash;
				var data = receipt.logs[2].data;
				console.log(data);
				var encodedLogs = receipt.logs[0].topics;
				var decodedLogs = App.web3.eth.abi.decodeLog(inputs, data, encodedLogs);
				App.deleteImg(decodedLogs.tokenID, decodedLogs.tokenURI);
			})

		}).catch((error) => {
			console.log(error);
			Swal.close();
			if(error.code === 4001){
				Swal.fire({
					icon: "error",
					title: 'Error!',
					text: 'You need to accept the transaction to burn the NFT',
					showConfirmButton:true,
					confirmButtonColor: '#e27d5f',
				})
			}
		});
	},

	uploadImg: function (userAddress, tokenID, tokenURI, title, transactionHash) {
		console.log("A new token has been minted!");
		console.log(event);

		var fd = new FormData();
		fd.append('image', file, filename);
		fd.append('owner', userAddress);
		fd.append('id', tokenID);
		fd.append('tokenURI', tokenURI);
		fd.append('title', title);
		fd.append('txHash', transactionHash);

		$.ajax({
  		type: "POST",
  		url: "/items/upload-item",
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
						//App.initGallery();
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

	deleteImg: function (tokenID, tokenURI) {
		console.log("A token has been burned!");

		jsonData = JSON.stringify(
			{id: tokenID, tokenURI: tokenURI}
		);

		$.ajax({
  		type: "POST",
  		url: "/items/delete-item",
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
	},

	waitForReceipt: function (hash, cb) {
		console.log(hash);
	  App.web3.eth.getTransactionReceipt(hash, function (err, receipt) {
	    if (err) {
	      console.log(err);
	    }

	    if (receipt !== null) {
	      console.log(receipt);
	      if (cb) {
	        cb(receipt);
	      }
	    } else {
	      // Try again in 1 second
	      window.setTimeout(function () {
	        App.waitForReceipt(hash, cb);
	      }, 1000);
	    }
	  });
	},

	minimizeAddress: function(address){
		var minAddress = address.substring(0,4) + "..." + address.slice(-4);
		return minAddress;
	}
}


//Call init whenever the window loads
$(function() {

	App.initGallery();
	App.init();
});
