// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract NFTReceiverContract is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    address public nftContract; // Address of the NFT contract
    // string public receivedMessage; // Stores the last message received from the oracle
    uint256 public receivedTokenId;
    address public receivedReceiver;
    string public receivedTokenURI;
    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // Payment to oracle (0.1 LINK)

    event MessageReceived(bytes32 indexed requestId, string message);
    event NFTMinted(address indexed receiver, uint256 indexed tokenId, string tokenURI);

    /**
     * @notice Constructor to set up the contract.
     * @param _nftContract Address of the NFT contract used to mint NFTs.
     * @param _linkToken Address of the LINK token used for Chainlink requests.
     */
    constructor(address _nftContract, address _linkToken) ConfirmedOwner(msg.sender) {
        _setChainlinkToken(_linkToken);
        nftContract = _nftContract;
    }

    /**
     * @notice Request data from the oracle.
     * @param _oracle Address of the Chainlink oracle.
     */
    function requestMessage(address _oracle) public onlyOwner {
        Chainlink.Request memory req = _buildChainlinkRequest(
            stringToBytes32("cc36bc200fce4edb90572f377d64b41b"),
            address(this),
            this.fulfillMessage.selector
        );
        req._add("get", "http://host.docker.internal:8000/receiver-nft"); // Endpoint to fetch the message
        req._add("path", "Message"); // JSON path to extract the message
        _sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
    }

    function fulfillMessage(
    bytes32 _requestId,
    uint256 _tokenId,
    address _receiver,
    string memory _tokenURI
) public recordChainlinkFulfillment(_requestId) {
    // emit MessageReceived(_requestId, _tokenId, _receiver, _tokenURI);

    // Store the received fields
    receivedTokenId = _tokenId;
    receivedReceiver = _receiver;
    receivedTokenURI = _tokenURI;

    _mintNFT(receivedReceiver, receivedTokenId, receivedTokenURI);
}


    /**
     * @notice Withdraw LINK tokens from the contract.
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(_chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }

    /**
     * @notice Internal function to mint an NFT.
     * @param receiver Address to mint the NFT to.
     * @param tokenId Token ID of the NFT.
     * @param tokenURI Metadata URI for the NFT.
     */
    function _mintNFT(address receiver, uint256 tokenId, string memory tokenURI) internal {
        // IERC721Metadata nft = IERC721Metadata(nftContract);

        // Call the mint function on the NFT contract (ensure it follows the same interface)
        // Assuming the NFT contract has a `mintWithTokenId` function like in the DummyNFT contract
        (bool success, ) = nftContract.call(
            abi.encodeWithSignature("mintWithTokenId(address,uint256,string)", receiver, tokenId, tokenURI)
        );

        require(success, "NFT minting failed");
        emit NFTMinted(receiver, tokenId, tokenURI);
    }

  
    /**
     * @notice Utility function to convert a string to bytes32.
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
