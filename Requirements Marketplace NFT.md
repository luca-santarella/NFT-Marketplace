#
# Requirements Marketplace NFT

##
# **General Description**

The following project is a web application which will allow the users to create their own [NFT](https://it.wikipedia.org/wiki/Non-fungible_token) (Non Fungible Token) which sticks to the [ERC721](https://ethereum.org/it/developers/docs/standards/tokens/erc-721/) standard (Ethereum Request for Comment) on the Ethereum blockchain (initially a [Ganache](https://www.trufflesuite.com/ganache) deploy will be done for testing purposes and then on the[Ropsten](https://ethereum.org/en/developers/docs/networks/#testnets) test net).

The NFTs that are allowed are of two kinds, a string of characters (not included in the first phase of the project) or an image that the user will upload, as far as storage is concerned the application will (initially) have a centralized storage of the NFTs on the server. In a second phase of the project a distributed approach will follow, using the [IPFS](https://ipfs.io/) (Inter Planetary File System) features.

![](RackMultipart20210823-4-137apag_html_c167c425a4de85b1.png)

The web application will be displayed as a website that shows a gallery of images and text (displayed as images) recently created from the users and it will also allow users to create a new NFT by means of a dedicated button. The only two functions are the view and creation function of NFTs. (In a later phase a delete or burn function can be implemented).

Thus, the end user can mint a new NFT in a total free and &quot;anonymous&quot; (i.e. no sign-up on the website) way by linking their wallet using the Metamask extension.

![](RackMultipart20210823-4-137apag_html_5a739405cfa6293a.png) ![](RackMultipart20210823-4-137apag_html_86e8466be838b063.jpg)

##
# **Technologies used**

In order to develop this project, a [smart contract](https://it.wikipedia.org/wiki/Smart_contract) on the Ethereum blockchain will manage the logic side of the application relying on an Ethereum standard, whereas the fronted side graphical aspect of the project will rely on HTML, CSS and JS or famous frameworks such as Bootstrap.

## Blockchain tools

Regarding the blockchain aspect of the project, an Ethereum smart contract written in the programming language [Solidity](https://docs.soliditylang.org/en/v0.8.6/) will be implemented following the ERC721 standard, which will handle the token usage, for the development the [Remix](https://remix.ethereum.org/) IDE will be used.

For the implementation of the standard ERC721 a [OpenZeppelin](https://docs.openzeppelin.com/contracts/2.x/api/token/erc721) contract will be used, which reduces the risk of vulnerabilities in the application by using standard, tested, community-reviewed code.

node modules such as the [web3](https://web3js.readthedocs.io/en/v1.4.0/), which is a collection of libraries that allow you to interact with a local or remote Ethereum node using HTTP, IPC or WebSocket and the [@truffle/contract](https://www.trufflesuite.com/docs/truffle/getting-started/interacting-with-your-contracts) library which is used to ease the interaction with smart contracts.

## Backend tools

The server will run on Node.js, integrated with external modules such as [Express JS](https://expressjs.com/), a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications and [Multer](https://www.npmjs.com/package/multer), which is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files

## Frontend tools

The graphical aspect of the website will be covered using HTML5, CSS3 and JavaScript with the aid of the [Bootstrap](https://getbootstrap.com/) framework and [jQuery](https://jquery.com/). The application will also use external libraries such as:

- [Nanogallery2](https://nanogallery2.nanostudio.org/) for the image gallery
- [SweetAlert2](https://sweetalert2.github.io/) for the popup and alerts
