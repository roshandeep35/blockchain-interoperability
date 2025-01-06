// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DummyNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => bool) public lockedTokens;

    constructor() ERC721("DummyNFT", "DNFT") Ownable(msg.sender) {}

    /**
     * @notice Mint a new NFT with metadata URI
     * @param to Address to mint the NFT to
     * @param tokenURI Metadata URI for the NFT
     */
    function mint(address to, string memory tokenURI) public onlyOwner returns (uint256){
        uint256 tokenId = nextTokenId;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        nextTokenId++;
        return tokenId;
    }

    function mintWithTokenId(address to, uint256 tokenId, string memory tokenURI) public onlyOwner {
    // require(!_exists(tokenId), "Token ID already exists"); // Ensure uniqueness
    _mint(to, tokenId); // Mint the token with the specific Token ID
    _setTokenURI(tokenId, tokenURI); // Set metadata URI
}

    /**
     * @notice Lock an NFT for cross-chain transfer
     * @param tokenId Token ID to lock
     */
    function lock(uint256 tokenId) public onlyOwner {
        // require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        lockedTokens[tokenId] = true;
    }

    /**
     * @notice Unlock an NFT after a failed transfer
     * @param tokenId Token ID to unlock
     */
    function unlock(uint256 tokenId) public onlyOwner {
        require(lockedTokens[tokenId], "Token is not locked");
        lockedTokens[tokenId] = false;
    }

    /**
     * @notice Burn an NFT (used when transferring to another chain)
     * @param tokenId Token ID to burn
     */
    function burn(uint256 tokenId) public onlyOwner {
        // require(_exists(tokenId), "Token does not exist");
        require(lockedTokens[tokenId], "Token must be locked");
        _burn(tokenId);
        lockedTokens[tokenId] = false;
    }
}
