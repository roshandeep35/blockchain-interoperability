// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract ReceiverContract is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK
    string public receivedMessage;

    event MessageReceived(bytes32 indexed requestId, string message);

    /**
     * @notice Constructor to set up the contract.
     * Replace the LINK address with the one appropriate for your network.
     */
    constructor() ConfirmedOwner(msg.sender) {
        _setChainlinkToken(0xa6c0888C1607d27908eDd660F762e488C757F88f); // LINK token address on Sepolia
    }

    /**
     * @notice Request to fetch the message from the external adapter.
     * @param _oracle The address of the oracle to interact with.
     * @param _jobId The job ID to trigger the task.
     */
    function requestMessage(address _oracle, string memory _jobId) public onlyOwner {
        Chainlink.Request memory req = _buildChainlinkRequest(
            stringToBytes32(_jobId),
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
