// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC677 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    /**
     * @dev ERC-677 `transferAndCall` function to transfer tokens and invoke a callback.
     * @param to The recipient address.
     * @param amount The amount to transfer.
     * @param data Arbitrary data to forward to the callback.
     * @return success A boolean indicating whether the operation succeeded.
     */
    function transferAndCall(
        address to,
        uint256 amount,
        bytes calldata data
    ) external returns (bool success) {
        _transfer(_msgSender(), to, amount);
        
        if (_isContract(to)) {
            // Call `onTokenTransfer` on the recipient
            (success, ) = to.call(
                abi.encodeWithSignature(
                    "onTokenTransfer(address,uint256,bytes)", 
                    _msgSender(), 
                    amount, 
                    data
                )
            );
        }

        return success;
    }

    /**
     * @dev Internal function to check if an address is a contract.
     */
    function _isContract(address addr) private view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }
}