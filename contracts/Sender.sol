// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Router} from "./Router.sol";
import {DummyToken} from "./DummyToken.sol";

contract Sender {
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);

    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        string text,
        address feeToken,
        uint256 fees,
        address sender
    );

    event TokenSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        uint256 tokenAmount,
        address feeToken,
        uint256 fees,
        address sender
    );

    Router private s_router;
    DummyToken private s_dummyToken;

    // Updated constructor to include DummyToken address
    constructor(address _router, address _dummyToken) {
        s_router = Router(_router);
        s_dummyToken = DummyToken(_dummyToken);
    }

    // Existing sendMessage() function
    function sendMessage(
        uint64 destinationChainSelector,
        address receiver,
        string calldata text
    ) external returns (bytes32 messageId) {
        bytes memory data = abi.encode(text);
        bytes memory receiverEncoded = abi.encode(receiver);
        uint256 fees = s_router.getFee(destinationChainSelector, data, receiverEncoded); 
        
        if (fees > s_dummyToken.balanceOf(address(this))) {
            revert NotEnoughBalance(s_dummyToken.balanceOf(address(this)), fees);
        }
        
        s_dummyToken.approve(address(s_router), fees);
        messageId = s_router.ccipSend(destinationChainSelector, data, receiverEncoded);
        emit MessageSent(messageId, destinationChainSelector, receiver, text, address(s_dummyToken), fees, msg.sender);
        return messageId;
    }

    // New sendToken() function
    function sendToken(
        uint64 destinationChainSelector,
        address receiver,
        uint256 tokenAmount
    ) external returns (bytes32 messageId) {
        require(s_dummyToken.balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");

        // Transfer tokens from the sender to this contract and approve them for the router
        s_dummyToken.transferFrom(msg.sender, address(this), tokenAmount);
        s_dummyToken.approve(address(s_router), tokenAmount);

        bytes memory data = abi.encode(tokenAmount);
        bytes memory receiverEncoded = abi.encode(receiver);
        uint256 fees = s_router.getFee(destinationChainSelector, data, receiverEncoded);

        if (fees > s_dummyToken.balanceOf(address(this))) {
            revert NotEnoughBalance(s_dummyToken.balanceOf(address(this)), fees);
        }

        messageId = s_router.ccipSend(destinationChainSelector, data, receiverEncoded);
        emit TokenSent(messageId, destinationChainSelector, receiver, tokenAmount, address(s_dummyToken), fees, msg.sender);
        return messageId;
    }
}
