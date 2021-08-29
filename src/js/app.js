//Luca Santarella - NFT Marketplace

App = {
	contracts: {}, //store contract abstractions
	web3Provider: null, //web3 provider
	account: '0x0',  //current Ethereum account
	input: null,
	instance: null,
	itemsNFTGallery: [],  //Array of the gallery item objects

	initGallery: function(){
		imagesArr = [];
		jQuery(document).ready(function () {
			$.ajax({
				type: "GET",
				url: "/NFT-images",
				success: function(data, textStatus, jqXHR) {
					console.log(data);
					data.forEach(NFT => {
						minOwner = NFT.owner.slice(0,5) + '...' + NFT.owner.slice(-5);
						imageObj = {src: NFT.tokenURI, title: NFT.title, description: "Token ID: "+NFT.id+" Owner: "+NFT.owner};
						imagesArr.push(imageObj);
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
						items: imagesArr
					});
				},
				error: function(jqXHR, textStatus, errorThrown) {
					alert('Error occurred!');
				},
			});

		});
	},

	addLowerToolbar: function($thumbnail, item, GOMidx){


		itemObj = {item: item, divThumbnail: $thumbnail};
		console.log(App.itemsNFTGallery);
		App.itemsNFTGallery.push(itemObj);
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


		//user has already connected before image was loaded
		if(App.account != '0x0'){
			console.log("App.account (inside loadImage) is "+App.account)
			var owner = "";
			splitDescr = item.description.split(" ");  //TODO maybe reengineer it
			for(var i=0; i<splitDescr.length; i++){
				if(splitDescr[i].includes('0x')){
					owner = splitDescr[i];
					console.log("owner: "+owner);
				}
			}
			if(App.account === owner.toLowerCase()){
				lowerToolbarText.css({'width':'70%'});
				App.addDeleteBtn(lowerToolbar);
			}
		}
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
									App.account = account;
									console.log("account: "+account);
									App.itemsNFTGallery.forEach(function(itemObj) {
										var owner = "";
										splitStr = itemObj.item.description.split(" ");  //maybe reengineer it
										for(var i=0; i<splitStr.length; i++){
											if(splitStr[i].includes('0x')){
												owner = splitStr[i];
												console.log("owner: "+owner);
											}
										}
										if(account === owner.toLowerCase()){
											lowerToolbarText = itemObj.divThumbnail.find('.lowerToolbarText');
											lowerToolbarText.css({'width':'70%'});

											lowerToolbar= itemObj.divThumbnail.find('.lowerToolbar');
											App.addDeleteBtn(lowerToolbar);
										}
									});
									//console.log(account);
								}
							});
							console.log("DApp connected"); });
							sessionStorage.setItem('isConnected', true);
							$('#connectBtn').text("Connected ✓");
							$('#connectBtn').prop('disabled', true);
							$('input').off();
							$('#connectBtn').off();
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

	addDeleteBtn: function(lowerToolbar){

		var lowerToolbarBtn = $("<div>")
			.addClass('lowerToolbarBtn d-flex justify-content-end')
			.appendTo(lowerToolbar)
			.on('click', function(){App.deleteNFT();});

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

			$('input').on('change', App.createNFT);

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

	createNFT: function(){
		App.input = document.querySelector('input');
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

	deleteNFT: function(){
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
		    Swal.fire(
		      'Deleted!',
		      'Your file has been deleted.',
		      'success'
		    )
		  }
		})
	},
}


//Call init whenever the window loads
$(function() {

	App.initGallery();
	App.init();
});
