// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts@1.2.0/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.2.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts@1.2.0/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract CrossChainMessenger is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    // Constants for Oracle configuration
    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 * 10**18
    
    // Struct to track message details
    struct Message {
        uint256 destChainId;
        address receiverContract;
        string messageContent;
        bool processed;
    }

    // Mapping to store messages
    mapping(bytes32 => Message) public messages;
    
    // Counter for message IDs
    uint256 public messageCounter;

    // Events to log message sending and confirmation
    event MessageSent(
        bytes32 indexed messageId, 
        uint256 destChainId, 
        address receiverContract, 
        string message
    );

    event MessageConfirmed(
        bytes32 indexed messageId, 
        string message, 
        bool confirmed
    );

    /**
     * Constructor for Sepolia network
     * @dev LINK address in Sepolia network
     */
    constructor() ConfirmedOwner(msg.sender) {
        _setChainlinkToken(0xfB91AD3981cD6DB654Fb089bB0fC5de0209123B2);
    }

    /**
     * Send a cross-chain message via Chainlink oracle
     * @param _destChainId Destination chain ID
     * @param _receiverContract Address of the receiver contract
     * @param _message Message content to send
     */
    function sendMessage(
        address _oracle,
        uint256 _destChainId, 
        address _receiverContract, 
        string memory _message
    ) public onlyOwner returns (bytes32) {
        // Generate unique message ID
        bytes32 messageId = keccak256(
            abi.encodePacked(
                messageCounter, 
                block.timestamp, 
                msg.sender
            )
        );
        messageCounter++;

        // Prepare Chainlink request
        Chainlink.Request memory req = _buildChainlinkRequest(
            stringToBytes32("211edec633aa4a3c87f99673e0687995"),
            address(this),
            this.fulfillMessage.selector
        );

        // Add message details to the request
        req._add("destChainId", uint2str(_destChainId));
        req._add("receiverContract", addressToString(_receiverContract));
        req._add("message", _message);
        req._addBytes("messageID", abi.encodePacked(messageId));

        // Store message details
        messages[messageId] = Message({
            destChainId: _destChainId,
            receiverContract: _receiverContract,
            messageContent: _message,
            processed: false
        });

        // Send Chainlink request
        _sendChainlinkRequestTo(_oracle , req, ORACLE_PAYMENT);

        // Emit event
        emit MessageSent(messageId, _destChainId, _receiverContract, _message);

        return messageId;
    }

    /**
     * Callback function to handle message confirmation
     */
    function fulfillMessage(
        bytes32 _requestId, 
        bytes32 _messageId, 
        bool _confirmed
    ) public recordChainlinkFulfillment(_requestId) {
        messages[_messageId].processed = _confirmed;

        emit MessageConfirmed(_messageId, messages[_messageId].messageContent, _confirmed);
    }

    // Utility functions for type conversion
    function uint2str(uint _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    



    function addressToString(address _addr) internal pure returns(string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

    // Existing utility functions from previous contract...
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