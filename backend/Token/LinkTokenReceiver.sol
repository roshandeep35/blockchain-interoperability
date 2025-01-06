// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TokenReceiverContract
 * @dev A contract that receives token transfer details from a Chainlink oracle and transfers tokens to the receiver.
 */
contract TokenReceiverContract is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK

    // ERC677 token (Mock LINK token)
    IERC20 public token;

    // Event to log token transfers
    event TokensTransferred(address indexed receiver, uint256 amount);

    /**
     * @notice Constructor to set up the contract.
     * @param _tokenAddress The address of the ERC677 token.
     */
    constructor(address _tokenAddress) ConfirmedOwner(msg.sender) {
        _setChainlinkToken(0x663F3ad617193148711d28f5334eE4Ed07016602); // LINK token address on Sepolia
        token = IERC20(_tokenAddress);
    }

    /**
     * @notice Request to fetch token transfer details from the external adapter.
     * @param _oracle The address of the oracle to interact with.
     * @param _jobId The job ID to trigger the task.
     */
    function requestTokenTransferDetails(address _oracle, string memory _jobId) public onlyOwner {
        Chainlink.Request memory req = _buildChainlinkRequest(
            stringToBytes32(_jobId),
            address(this),
            this.fulfillTokenTransfer.selector
        );
        req._add("get", "http://host.docker.internal:8000/receiver"); // Endpoint to fetch token transfer details
        req._add("path", "ChainID,ReceiverAddress,Amount"); // Path to extract data from the response
        _sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
    }

    /**
     * @notice Fulfillment function called by the oracle.
     * @param _requestId The request ID.
     * @param _chainId The destination chain ID (unused in this contract).
     * @param _receiverAddress The address to transfer tokens to.
     * @param _amount The amount of tokens to transfer.
     */
    function fulfillTokenTransfer(
        bytes32 _requestId,
        uint256 _chainId,
        address _receiverAddress,
        uint256 _amount
    ) public recordChainlinkFulfillment(_requestId) {
        // Transfer tokens to the receiver
        require(_receiverAddress != address(0), "Invalid receiver address");
        require(_amount > 0, "Amount must be greater than 0");

        // Ensure the contract has enough tokens to transfer
        require(
            token.balanceOf(address(this)) >= _amount,
            "Insufficient token balance in the contract"
        );

        // Transfer tokens to the receiver
        bool success = token.transfer(_receiverAddress, _amount);
        require(success, "Token transfer failed");

        // Emit event
        emit TokensTransferred(_receiverAddress, _amount);
    }

    /**
     * @notice Withdraw LINK tokens from the contract.
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(_chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }

    /**
     * @notice Withdraw ERC677 tokens from the contract.
     */
    function withdrawTokens(address _tokenAddress, uint256 _amount) public onlyOwner {
        IERC20(_tokenAddress).transfer(msg.sender, _amount);
    }

    /**
     * @notice Utility function to convert a string to bytes32.
     * @param source The string to convert.
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
