   // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC677.sol"; // Import the ERC677 base contract

contract MockLinkToken is ERC677 {
    constructor() ERC677("Mock LINK", "LINK") {
        // Mint initial supply to the deployer
        _mint(msg.sender, 10000000 * 10**18);
    }

    /**
     * @dev Faucet function to mint tokens for testing purposes.
     */
    function faucet(address to, uint256 amount) public {
        _mint(to, amount);
    }
}