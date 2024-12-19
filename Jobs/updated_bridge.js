const Web3 = require("web3");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const web3 = new Web3("http://18.223.107.114:8545"); // Connect to Geth dev chain

const receiverAddress = "0xReceiverContractAddress"; // Replace with deployed ReceiverContract address
const abi = [
  /* ABI of the ReceiverContract */
];

const receiverContract = new web3.eth.Contract(abi, receiverAddress);

// Default unlocked account in Geth
const defaultAccount = web3.eth.accounts[0];

// Temporary storage for the latest received message
let latestMessage = null;

app.use(bodyParser.json());

// Middleware for authorization
const ACCESS_TOKEN = "gS+xc4XUsv3CA+iURw0b3H8gEit0VDlk";
app.use((req, res, next) => {
  const token = req.headers["authorization"];
  if (token !== `Bearer ${ACCESS_TOKEN}`) {
    return res.status(403).send("Unauthorized");
  }
  next();
});

// Function to forward the message to the blockchain
const forwardMessage = async (message) => {
  const { chainId, receiver, messageId, message: msg } = message;

  try {
    console.log("Preparing transaction to forward message...");

    const tx = receiverContract.methods.fulfillMessage(messageId, msg);

    const txData = {
      from: defaultAccount,
      to: receiverAddress,
      gas: 500000,
      data: tx.encodeABI(),
    };

    console.log("Sending transaction using unlocked account...");
    const receipt = await web3.eth.sendTransaction(txData);

    console.log("Transaction successful:", receipt.transactionHash);
    return { success: true, txHash: receipt.transactionHash };
  } catch (error) {
    console.error("Error forwarding message:", error);
    return { success: false, error: error.message };
  }
};

// Endpoint to receive data, store it, and forward it automatically
app.post("/receive", async (req, res) => {
  const { chainId, receiver, messageId, message } = req.body;

  if (!chainId || !receiver || !messageId || !message) {
    return res.status(400).send("Invalid payload");
  }

  console.log("Data received:", req.body);
  latestMessage = req.body; // Save the latest message for retrieval

  // Automatically forward the message
  const result = await forwardMessage(latestMessage);

  if (result.success) {
    res.status(200).send({
      message: "Data processed, stored, and forwarded successfully",
      txHash: result.txHash,
    });
  } else {
    res.status(500).send({
      message: "Data processed and stored, but forwarding failed",
      error: result.error,
    });
  }
});

// Endpoint to retrieve the latest message
app.get("/receiver", (req, res) => {
  if (!latestMessage) {
    return res.status(404).send("No message available");
  }
  res.status(200).json(latestMessage);
});

app.listen(8000, () => console.log("Bridge server running on port 8000"));

/**
 * TODO: Integrate a secure wallet for private key management.
 * In production, replace the unlocked account usage with:
 * - Secure storage for private keys (AWS Secrets Manager, HashiCorp Vault).
 * - Hardware wallets or Web3 providers with secure key management.
 */
