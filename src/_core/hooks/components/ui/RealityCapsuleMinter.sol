// RealityCapsuleMinter.sol - Remix/Foundry deploy Fuji
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealityCapsuleMinter is ERC721, Ownable {
    uint256 private _nextTokenId;
    mapping(uint256 => uint256) public timestamps; // Immutable proof

    constructor() ERC721("RealityCapsule", "RCAP") Ownable(msg.sender) {}

    function mintTimestampOnly(uint256 tokenId) external payable {
        require(msg.value >= 0.0001 ether, "Gas: 0.0001 AVAX min");
        require(tokenId > 0, "Invalid tokenId");
        require(_ownerOf(tokenId) == address(0), "Exists");

        _safeMint(msg.sender, tokenId);
        timestamps[tokenId] = block.timestamp;
        _nextTokenId = tokenId + 1;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked("https://realityprotocol.io/metadata/", toString(tokenId)));
    }

    function toString(uint256 value) internal pure returns (string memory) {
        // Std uint→string (Remix deployable)
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) { digits -= 1; buffer[digits] = bytes1(uint8(48 + uint256(value % 10))); value /= 10; }
        return string(buffer);
    }
}
