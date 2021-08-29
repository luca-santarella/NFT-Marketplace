// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTCollection is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    //mapping for token URIs
    mapping (uint256 => string) private _tokenURIs;

    event mintedToken(uint256 tokenID, address userAddress, string tokenURI);
    event burnedToken(uint256 tokenID);

    constructor() ERC721("NFTCollection", "NFTC") {}

    function _setTokenURI(uint256 tokenID, string memory _tokenURI) internal virtual {
        _tokenURIs[tokenID] = _tokenURI;
    }

    function mintToken(address userAddress, string memory _tokenURI) public {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();
        _safeMint(userAddress, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        emit mintedToken(newTokenId, userAddress, _tokenURI);
    }

    function burnToken(uint256 tokenID) public {
        address owner = ERC721.ownerOf(tokenID);
        require(msg.sender == owner, "You are not the owner of this NFT");
        _burn(tokenID);
        emit burnedToken(tokenID);
    }

    function tokenURI(uint256 tokenID) public view virtual override returns (string memory){
        return _tokenURIs[tokenID];
    }


}
