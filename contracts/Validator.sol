pragma solidity ^0.8.4;

contract Validator {
    error InvalidSender(address sender);
    error InvalidMessage(bytes data);
    error UnauthorizedCaller(address caller);

    event MessageValidated(bytes32 indexed messageId, address sender, address receiver, string text);

    address private immutable router;
    mapping(address => bool) public authorizedSenders;

    constructor(address _router) {
        router = _router;
    }

    modifier onlyRouter() {
        require(msg.sender == router, "Caller is not the router");
        _;
    }

    function authorizeSender(address sender, bool isAuthorized) external onlyRouter {
        authorizedSenders[sender] = isAuthorized;
    }

    function validateMessage(
        bytes32 messageId,
        address sender,
        address receiver,
        string calldata text,
        bytes calldata data
    ) external onlyRouter {
        // Ensure the sender is authorized
        if (!authorizedSenders[sender]) {
            revert InvalidSender(sender);
        }

        // Decode and validate the message content
        string memory decodedText = abi.decode(data, (string));
        if (keccak256(abi.encodePacked(decodedText)) != keccak256(abi.encodePacked(text))) {
            revert InvalidMessage(data);
        }

        // Emit an event to indicate successful validation
        emit MessageValidated(messageId, sender, receiver, text);
    }
}
