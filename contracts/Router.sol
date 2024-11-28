// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./DummyToken.sol";

contract Router {
    DummyToken private dummyToken;

    event MessageForwarded(bytes32 messageId);

    constructor(address _dummyToken) {
        dummyToken = DummyToken(_dummyToken);
    }

    function getFee(
        uint64 /* destinationChainSelector */,
        bytes memory data,
        bytes memory receiver
    ) public view returns (uint256 fee) {
        fee = 10*10**18; 
    }

    function ccipSend(
        uint64 destinationChainSelector,
        bytes memory data,
        bytes memory receiver
    ) public payable returns (bytes32 messageId) {
        messageId = keccak256(abi.encodePacked(destinationChainSelector, data, receiver, block.timestamp));
        emit MessageForwarded(messageId);
    }
}
