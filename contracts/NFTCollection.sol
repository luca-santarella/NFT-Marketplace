// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTCollection is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    //mapping for token URIs
    mapping (uint256 => bytes32) private _tokenURIs;

    //mapping for token titles
    mapping (uint256 => string) private _titles;

    event mintedToken(uint256 tokenID, address userAddress, bytes32 tokenURI, string title);
    event burnedToken(uint256 tokenID, address userAddress, bytes32 tokenURI, string title);

    constructor() ERC721("NFTCollection", "NFTC") {}

    function _setTokenURI(uint256 tokenID, string memory _tokenURI) internal virtual returns (bytes32) {
        bytes32 _hashedTokenURI = keccak256(abi.encodePacked(_tokenURI));
        _tokenURIs[tokenID] = _hashedTokenURI;
        return _hashedTokenURI;
    }

    function mintToken(address userAddress, string memory _tokenURI, string memory _title) public {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();
        _safeMint(userAddress, newTokenId);
        bytes32 _hashedTokenURI = _setTokenURI(newTokenId, _tokenURI);
        _titles[newTokenId] = _title;
        emit mintedToken(newTokenId, userAddress, _hashedTokenURI, _title);
    }

    function burnToken(uint256 tokenID) public {
        address owner = ERC721.ownerOf(tokenID);
        require(msg.sender == owner, "You are not the owner of this NFT");
        _burn(tokenID);
        emit burnedToken(tokenID, owner, _tokenURIs[tokenID], _titles[tokenID]);
    }

    function getTokenURI(uint256 tokenID) public view virtual returns (bytes32){
        return _tokenURIs[tokenID];
    }


}
