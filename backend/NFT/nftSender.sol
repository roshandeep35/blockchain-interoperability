// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract NFTSender is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK

    address public nftContract; // The NFT contract address
    mapping(uint256 => bool) public lockedTokens; // Track locked tokens
    mapping(bytes32 => uint256) public requestIdToTokenId; // Track request IDs to token IDs

    event NFTLocked(uint256 indexed tokenId, address indexed owner, uint256 destChainId, address receiver);
    event NFTBurned(uint256 indexed tokenId, address indexed owner);
    event CrossChainTransferConfirmed(bytes32 indexed requestId, uint256 indexed tokenId);

    constructor(address _nftContract, address _linkToken) ConfirmedOwner(msg.sender) {
        _setChainlinkToken(_linkToken);
        nftContract = _nftContract;
    }

    
    function lockAndSendNFT(
        address _oracle,
        // string memory _jobId,
        uint256 _destChainId,
        address _receiver,
        uint256 _tokenId
    ) public {
        require(IERC721(nftContract).ownerOf(_tokenId) == msg.sender, "You are not the owner of the token");
        require(!lockedTokens[_tokenId], "Token is already locked");

        // Lock the token
        lockedTokens[_tokenId] = true;
        emit NFTLocked(_tokenId, msg.sender, _destChainId, _receiver);

        // Prepare metadata to send
        string memory tokenURI = IERC721Metadata(nftContract).tokenURI(_tokenId);

        string memory jobId = "423176a70dbf4b3e92241ecada77dded"; 
        // Build Chainlink request
        Chainlink.Request memory req = _buildChainlinkRequest(
            stringToBytes32(jobId),
            address(this),
            this.fulfillTransfer.selector
        );
        req._add("destChainId", uint2str(_destChainId));
        req._add("receiver", addressToString(_receiver));
        req._add("tokenId", uint2str(_tokenId));
        req._add("metadata", tokenURI); // Sending metadata

        // Store the request-to-tokenId mapping
        bytes32 requestId = _sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
        requestIdToTokenId[requestId] = _tokenId;
    }

    /**
     * @notice Fulfillment function to confirm cross-chain transfer.
     * @param _requestId The request ID.
     * @param _success Whether the transfer was successful.
     */
    function fulfillTransfer(bytes32 _requestId, bool _success)
        public
        recordChainlinkFulfillment(_requestId)
    {
        uint256 tokenId = requestIdToTokenId[_requestId];
        require(lockedTokens[tokenId], "Token is not locked");

        if (_success) {
            // Burn the NFT after successful transfer
            _burnNFT(tokenId);
            emit CrossChainTransferConfirmed(_requestId, tokenId);
        } else {
            // Unlock the token if transfer fails
            lockedTokens[tokenId] = false;
        }
    }

    /**
     * @notice Burn an NFT.
     * @param _tokenId The ID of the token to burn.
     */
    function _burnNFT(uint256 _tokenId) internal {
        require(lockedTokens[_tokenId], "Token is not locked");
        lockedTokens[_tokenId] = false;

        // Call the NFT contract to burn the token
        (bool success, ) = nftContract.call(
            abi.encodeWithSignature("burn(uint256)", _tokenId)
        );
        require(success, "Burning the NFT failed");

        emit NFTBurned(_tokenId, msg.sender);
    }

    /**
     * @notice Utility function to convert a uint to string.
     */
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            bstr[k] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @notice Utility function to convert an address to string.
     */
    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    /**
     * @notice Utility function to convert string to bytes32.
     */
    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }
}
