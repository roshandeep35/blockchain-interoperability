// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts@1.2.0/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.2.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts@1.2.0/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";



contract TokenReceiver is ERC20, ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK
    string public jobId;
    address public oracle;

    event TokenReceived(bytes32 indexed requestId, address recipient, uint256 amount);
    event Minted(address recipient, uint256 amount);

    constructor(address _oracle, string memory _jobId, address linkTokenAddress)
        ERC20("Mock LINK", "LINK")
        ConfirmedOwner(msg.sender)
    {
        
        _setChainlinkToken(linkTokenAddress);
        oracle = _oracle;
        jobId = _jobId;
    }

    /**
     * @notice Request to receive tokens from an external source.
     * @param recipient The address to mint tokens to.
     * @param amount The amount of tokens to mint.
     */
    function receiveToken(address recipient, uint256 amount) public onlyOwner {
        Chainlink.Request memory req = _buildChainlinkRequest(
            stringToBytes32(jobId),
            address(this),
            this.fulfillTokenReceive.selector
        );
        
        // Add parameters to the request (customize endpoint as needed)
        req._add("recipient", toString(recipient));
        req._addUint("amount", amount);

        _sendChainlinkRequestTo(oracle, req, ORACLE_PAYMENT);
    }

    /**
     * @notice Fulfillment function called by the Chainlink oracle.
     * @param _requestId The ID of the request.
     * @param recipient The recipient of the tokens.
     * @param amount The amount of tokens to mint.
     */
    function fulfillTokenReceive(bytes32 _requestId, address recipient, uint256 amount)
        public
        recordChainlinkFulfillment(_requestId)
    {
        _mint(recipient, amount);
        emit TokenReceived(_requestId, recipient, amount);
        emit Minted(recipient, amount);
    }

    /**
     * @notice Withdraw LINK tokens from the contract.
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(_chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }

    /**
     * @notice Utility function to convert string to bytes32.
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

    /**
     * @notice Utility function to convert address to string.
     */
    function toString(address account) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(account)), 20);
    }
}
