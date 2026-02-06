// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title HonestTruthCertificate
 * @dev ERC-721 NFT contract for minting H.O.N.E.S.T. Truth Certificates on Avalanche C-Chain
 * 
 * Each NFT represents a cryptographically verified market eigenstate verdict with:
 * - 6D eigenstate dimensions (price, volume, momentum, sentiment, temporal, spatial)
 * - Coherence score (-1 to 1)
 * - Market decision (BUY/SELL/HOLD)
 * - 5-layer recursive truth verification proof
 * - Timestamp and asset identifier
 * 
 * Created for Avalanche x402 Hackathon (Payments track)
 * Reality Protocol LLC - Apache 2.0 License
 */
contract HonestTruthCertificate is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Struct to store eigenstate data on-chain
    struct EigenstateRecord {
        string asset;           // e.g., "BTC", "ETH", "AVAX"
        uint256 timestamp;      // Unix timestamp of eigenstate calculation
        int256 coherence;       // Coherence score (-1000 to 1000, scaled by 1000)
        string decision;        // "BUY", "SELL", or "HOLD"
        bytes32 proofHash;      // SHA-256 hash of full eigenstate data + proof
        string dataURI;         // IPFS or HTTP URI to full eigenstate JSON
    }

    // Mapping from token ID to eigenstate record
    mapping(uint256 => EigenstateRecord) public eigenstates;

    // Events
    event TruthCertificateMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string asset,
        int256 coherence,
        string decision,
        bytes32 proofHash
    );

    constructor() ERC721("HONEST Truth Certificate", "HONEST") Ownable(msg.sender) {}

    /**
     * @dev Mint a new Truth Certificate NFT with eigenstate data
     * @param recipient Address to receive the NFT
     * @param asset Market asset identifier (e.g., "BTC")
     * @param timestamp Unix timestamp of eigenstate calculation
     * @param coherence Coherence score (-1000 to 1000, scaled by 1000 for precision)
     * @param decision Market decision ("BUY", "SELL", "HOLD")
     * @param proofHash SHA-256 hash of full eigenstate data + 5-layer proof
     * @param dataURI URI to full eigenstate JSON (IPFS or HTTP)
     * @param tokenURI Metadata URI for NFT (image, description, attributes)
     * @return tokenId The ID of the newly minted NFT
     */
    function mintTruthCertificate(
        address recipient,
        string memory asset,
        uint256 timestamp,
        int256 coherence,
        string memory decision,
        bytes32 proofHash,
        string memory dataURI,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(asset).length > 0, "Asset identifier required");
        require(coherence >= -1000 && coherence <= 1000, "Coherence must be between -1000 and 1000");
        require(
            keccak256(bytes(decision)) == keccak256(bytes("BUY")) ||
            keccak256(bytes(decision)) == keccak256(bytes("SELL")) ||
            keccak256(bytes(decision)) == keccak256(bytes("HOLD")),
            "Decision must be BUY, SELL, or HOLD"
        );

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Store eigenstate record on-chain
        eigenstates[tokenId] = EigenstateRecord({
            asset: asset,
            timestamp: timestamp,
            coherence: coherence,
            decision: decision,
            proofHash: proofHash,
            dataURI: dataURI
        });

        emit TruthCertificateMinted(
            tokenId,
            recipient,
            asset,
            coherence,
            decision,
            proofHash
        );

        return tokenId;
    }

    /**
     * @dev Get eigenstate record for a given token ID
     * @param tokenId The NFT token ID
     * @return EigenstateRecord struct with all eigenstate data
     */
    function getEigenstateRecord(uint256 tokenId) public view returns (EigenstateRecord memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return eigenstates[tokenId];
    }

    /**
     * @dev Get total number of minted Truth Certificates
     * @return Total supply of NFTs
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Override required functions
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
