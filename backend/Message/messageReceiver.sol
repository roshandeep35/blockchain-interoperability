// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract MessageReceiverContract is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK
    string public receivedMessage;

    event MessageReceived(bytes32 indexed requestId, string message);

    /**
     * @notice Constructor to set up the contract.
     * Replace the LINK address with the one appropriate for your network.
     */
    constructor() ConfirmedOwner(msg.sender) {
        _setChainlinkToken(0x663F3ad617193148711d28f5334eE4Ed07016602); 
    }


    
    function requestMessage(address _oracle) public onlyOwner {
        Chainlink.Request memory req = _buildChainlinkRequest(
            stringToBytes32("b17f870be7d941cc91a6467108d76450"),
            address(this),
            this.fulfillMessage.selector
        );
        req._add("get", "http://host.docker.internal:8000/receiver"); // Endpoint to fetch the message
        req._add("path", "Message");
        _sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
    }

    /**
     * @notice Fulfillment function called by the oracle.
     * @param _requestId The request ID.
     * @param _message The fetched message.
     */
    function fulfillMessage(bytes32 _requestId, string memory _message)
        public
        recordChainlinkFulfillment(_requestId)
    {
        emit MessageReceived(_requestId, _message);
        receivedMessage = _message;
    }

    /**
     * @notice Withdraw LINK tokens from the contract.
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(_chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
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