npm install --save-dev hardhat @openzeppelin/contracts ethers dotenv
Step 1: Create .env File
# .env (in your project root)
PRIVATE_KEY=0xyour_private_key_here
SNOWTRACE_API_KEY=your_snowtrace_api_key_here  # Get from snowtrace.io
Step 2: Create Smart Contract
File: contracts/RealityProtocolNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealityProtocolNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    constructor(address initialOwner)
        ERC721("Reality Protocol Access", "RPA")
        Ownable(initialOwner)
    {}
    
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
    
    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
