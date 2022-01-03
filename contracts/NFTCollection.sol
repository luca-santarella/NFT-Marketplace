// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTCollection is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    //mapping for token URIs
    mapping (uint256 => string) private _tokenURIs;

    //mapping for token titles
    mapping (uint256 => string) private _titles;

    event mintedToken(uint256 tokenID, address userAddress, string tokenURI, string title);
    event burnedToken(uint256 tokenID, address userAddress, string tokenURI, string title);

    constructor() ERC721("NFTCollection", "NFTC") {}

    function mintToken(address userAddress, string memory _title, string memory _tokenURI) public {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();
        _tokenURIs[newTokenId] = _tokenURI;
        _safeMint(userAddress, newTokenId);
        _titles[newTokenId] = _title;
        emit mintedToken(newTokenId, userAddress, _tokenURI, _title);
    }

    function burnToken(uint256 tokenID) public {
        address owner = ERC721.ownerOf(tokenID);
        require(msg.sender == owner, "You are not the owner of this NFT");
        _burn(tokenID);
        emit burnedToken(tokenID, owner, _tokenURIs[tokenID], _titles[tokenID]);
    }

    function tokenURI(uint tokenID) public view virtual override returns (string memory){
        require(_exists(tokenID), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenID];
    }


}
