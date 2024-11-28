// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract Receiver {
    // Custom event to log the received message and the sender's address
    event MessageReceived(
        address sender,
        string messageText
    );

    address private immutable owner;

    constructor() {
        owner = msg.sender;
    }

    function receiveMessage(
        bytes memory messageData
    ) external {
        // Ensure the caller is authorized (you can modify this based on your security requirements)
        require(msg.sender == owner, "Only owner can call this function");

        // Decode the message data into a string
        string memory messageText = abi.decode(messageData, (string));

        // Emit an event for the received message
        emit MessageReceived(msg.sender, messageText);
    }
}