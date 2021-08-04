// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTItem is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    //mapping for token URIs
    mapping (uint256 => string) private _tokenURIs;
    
    constructor() ERC721("NFTItem", "NFTI") {}
    
    function _setTokenURI(uint256 tokenID, string memory _tokenURI) internal virtual {
        _tokenURIs[tokenID] = _tokenURI;
    }
    
    function newItem(address userAddress, string memory _tokenURI) public returns (uint256) {
        _tokenIds.increment();
        
        uint256 newItemId = _tokenIds.current();
        _mint(userAddress, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        
        return newItemId;
    }   
    
    function tokenURI(uint256 tokenID) public view virtual override returns (string memory){
        return _tokenURIs[tokenID];
    }
}
