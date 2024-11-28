// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./DummyToken.sol";

contract Tokenize {
    DummyToken public dummyToken;
    address public admin;

    mapping(address => uint256) public tokenizedAssets;

    event Tokenized(address indexed owner, uint256 assetValue, uint256 tokenAmount);

    constructor(address _dummyToken) {
        dummyToken = DummyToken(_dummyToken);
        admin = msg.sender;
    }

    function tokenizeAsset(uint256 assetValue) external {
        require(assetValue > 0, "Asset value must be greater than zero");

        uint256 tokenAmount = assetValue * 1e18; // Conversion logic: 1 asset unit = 1 token
        require(dummyToken.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");

        tokenizedAssets[msg.sender] += tokenAmount;
        emit Tokenized(msg.sender, assetValue, tokenAmount);
    }
}
