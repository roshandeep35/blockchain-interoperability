// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts@1.2.0/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.2.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CrossChainTokenSender is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK

    // Struct to track token transfer details
    struct TokenTransfer {
        uint256 destChainId;
        address receiverAddress;
        address tokenAddress;
        uint256 amount;
        bool processed;
    }

    // Mapping to store token transfers
    mapping(bytes32 => TokenTransfer) public tokenTransfers;

    // Counter for transfer IDs
    uint256 public transferCounter;

    // Events for logging
    event TokenTransferInitiated(
        bytes32 indexed transferId,
        uint256 destChainId,
        address receiverAddress,
        address tokenAddress,
        uint256 amount
    );

    event TokenTransferConfirmed(
        bytes32 indexed transferId,
        address tokenAddress,
        uint256 amount,
        bool confirmed
    );

    constructor() ConfirmedOwner(msg.sender) {
        _setChainlinkToken(0x663F3ad617193148711d28f5334eE4Ed07016602); // LINK token address for Sepolia network
    }

    /**
     * Send tokens cross-chain via Chainlink CCIP
     * @param _oracle Address of the Chainlink oracle
     * @param _destChainId Destination chain ID
     * @param _receiverAddress Address of the receiver on the destination chain
     * @param _tokenAddress Address of the ERC20 token to transfer
     * @param _amount Amount of tokens to transfer
     */
    function sendToken(
        address _oracle,
        uint256 _destChainId,
        address _receiverAddress,
        address _tokenAddress,
        uint256 _amount
    ) public onlyOwner returns (bytes32) {
        // Ensure the sender has enough tokens approved
        require(
            IERC20(_tokenAddress).allowance(msg.sender, address(this)) >= _amount,
            "Insufficient token allowance"
        );

        // Transfer tokens to the contract for locking
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);

        // Generate unique transfer ID
        bytes32 transferId = keccak256(
            abi.encodePacked(
                transferCounter,
                block.timestamp,
                msg.sender
            )
        );
        transferCounter++;

        // Prepare Chainlink request 
        Chainlink.Request memory req = _buildChainlinkRequest(
            stringToBytes32("211edec633aa4a3c87f99673e0687995"),
            address(this),
            this.fulfillTokenTransfer.selector
        );

        // Add transfer details to the request
        req._add("destChainId", uint2str(_destChainId));
        req._add("receiverAddress", addressToString(_receiverAddress));
        req._add("tokenAddress", addressToString(_tokenAddress));
        req._add("amount", uint2str(_amount));
        req._addBytes("transferId", abi.encodePacked(transferId));

        // Store transfer details
        tokenTransfers[transferId] = TokenTransfer({
            destChainId: _destChainId,
            receiverAddress: _receiverAddress,
            tokenAddress: _tokenAddress,
            amount: _amount,
            processed: false
        });

        // Send Chainlink request
        _sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);

        // Emit event
        emit TokenTransferInitiated(transferId, _destChainId, _receiverAddress, _tokenAddress, _amount);

        return transferId;
    }

    /**
     * Callback function to handle token transfer confirmation
     */
    function fulfillTokenTransfer(
        bytes32 _requestId,
        bytes32 _transferId,
        bool _confirmed
    ) public recordChainlinkFulfillment(_requestId) {
        TokenTransfer storage transfer = tokenTransfers[_transferId];
        transfer.processed = _confirmed;

        emit TokenTransferConfirmed(
            _transferId,
            transfer.tokenAddress,
            transfer.amount,
            _confirmed
        );
    }

    /**
     * Utility function to withdraw tokens from the contract (for emergency purposes)
     */
    function withdrawTokens(address _tokenAddress, uint256 _amount) public onlyOwner {
        IERC20(_tokenAddress).transfer(msg.sender, _amount);
    }

    // Utility functions for type conversion
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint256(uint8(value[i + 12] >> 4))];
            str[3 + i * 2] = alphabet[uint256(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

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
