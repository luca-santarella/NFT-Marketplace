#
# Requirements Marketplace NFT

##
## **General Description**

The following project is a web application which will allow the users to create their own [NFT](https://it.wikipedia.org/wiki/Non-fungible_token) (Non Fungible Token) which sticks to the [ERC721](https://ethereum.org/it/developers/docs/standards/tokens/erc-721/) standard (Ethereum Request for Comment) on the Ethereum blockchain (initially a [Ganache](https://www.trufflesuite.com/ganache) deploy will be done for testing purposes and the on the [Ropsten](https://ethereum.org/en/developers/docs/networks/#testnets) test net).

The NFTs that are allowed are of two kinds, a string of characters or an image that the user will upload, as far as storage is concerned the application will (initially) have a centralized storage of the NFTs on the server. In a second phase of the project a distributed approach will follow, using the [IPFS](https://ipfs.io/) (Inter Planetary File System) features.

![](RackMultipart20210802-4-1cngm0m_html_c167c425a4de85b1.png)

The web application will be displayed as a website that shows a gallery of images and text recently created from the users and it will also allow users to create a new NFT by means of a dedicated button. The only two functions are the view and creation function of NFTs.

Thus, the end user can mint a new NFT in a total free and anonymous way by linking their wallet using the Metamask extension.

![](RackMultipart20210802-4-1cngm0m_html_5a739405cfa6293a.png) ![](RackMultipart20210802-4-1cngm0m_html_86e8466be838b063.jpg)

##
## **Technologies used**

In order to develop this project, a set of blockchain technologies will be used such as [smart contracts](https://it.wikipedia.org/wiki/Smart_contract) which will manage the logic side of the application, whereas the fronted side graphical aspect of the project will rely on HTML, CSS and JS or famous frameworks such as Bootstrap.

### BACKEND SIDE

Regarding the backend side, a smart contract will be implemented following the ERC721 standard, which will handle the token usage, will be written in the programming language [Solidity](https://docs.soliditylang.org/en/v0.8.6/) and using the [Remix](https://remix.ethereum.org/) IDE.

OpenZeppelin
