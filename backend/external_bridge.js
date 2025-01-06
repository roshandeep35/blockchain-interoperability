const { ethers } = require('ethers');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Account details
const accountAddress = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
const privateKey = ''; // Replace with your private key

const messageReceiverAddress = '0xfF524Cfa30Beb84Ae86032705184015C9Ea6b903';
// const tokenReceiverAddresss = '';
const nftReceiverAddress = '0xb769521bf6ddFc610fcdbc03Ca13A6d7153E104A';

// Connect to Geth dev chain
const provider = new ethers.JsonRpcProvider('http://13.58.232.153:8545');

// Create a wallet/signer using the private key and provider
const signer = new ethers.Wallet(privateKey, provider);

const messageReceiverAbi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ChainlinkCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ChainlinkFulfilled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ChainlinkRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'message',
        type: 'string',
      },
    ],
    name: 'MessageReceived',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_requestId',
        type: 'bytes32',
      },
      {
        internalType: 'string',
        name: '_message',
        type: 'string',
      },
    ],
    name: 'fulfillMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'receivedMessage',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_oracle',
        type: 'address',
      },
    ],
    name: 'requestMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawLink',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const tokenReceiverAbi = [];
const nftReceiverAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftContract',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_linkToken',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ChainlinkCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ChainlinkFulfilled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'ChainlinkRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'message',
        type: 'string',
      },
    ],
    name: 'MessageReceived',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'tokenURI',
        type: 'string',
      },
    ],
    name: 'NFTMinted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_requestId',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_receiver',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_tokenURI',
        type: 'string',
      },
    ],
    name: 'fulfillMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nftContract',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'receivedReceiver',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'receivedTokenId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'receivedTokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_oracle',
        type: 'address',
      },
    ],
    name: 'requestMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawLink',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Connect the signer to the contract
const messageReceiverContract = new ethers.Contract(
  messageReceiverAddress,
  messageReceiverAbi,
  signer
);

// const tokenReceiverContract = new ethers.Contract(
//   tokenReceiverAddress,
//   tokenReceiverAbi,
//   signer
// );

const nftReceiverContract = new ethers.Contract(
  nftReceiverAddress,
  nftReceiverAbi,
  signer
);

// Temporary storage for the latest received message, token and nft
let latestMessage = null;
let latestTokenMessage = null;
let latestNftMessage = null;

const oracleAddress = '0x9726fc549acaa0791d8c170843a031ec1d2f8a68';

app.use(bodyParser.json());

// Middleware for authorization
const ACCESS_TOKEN = 'gS+xc4XUsv3CA+iURw0b3H8gEit0VDlk';
app.use((req, res, next) => {
  const token = req.headers['authorization'];
  if (token !== `Bearer ${ACCESS_TOKEN}`) {
    return res.status(403).send('Unauthorized');
  }
  next();
});

// Forward function for messages
const forwardMessage = async (oracleAddress) => {
  try {
    console.log('Forwarding message to the blockchain...');
    const txResponse = await messageReceiverContract.requestMessage(
      oracleAddress
    );
    const receipt = await txResponse.wait();
    console.log('Message forwarded successfully:', receipt.transactionHash);
    return { success: true, txHash: receipt.transactionHash };
  } catch (error) {
    console.error('Error forwarding message:', error);
    return { success: false, error: error.message };
  }
};

// Forward function for tokens
const forwardToken = async (receiver, amount) => {
  try {
    console.log('Forwarding token transfer to the blockchain...');
    const txResponse = await tokenReceiverContract.transferToken(
      receiver,
      amount
    );
    const receipt = await txResponse.wait();
    console.log('Token transfer successful:', receipt.transactionHash);
    return { success: true, txHash: receipt.transactionHash };
  } catch (error) {
    console.error('Error forwarding token transfer:', error);
    return { success: false, error: error.message };
  }
};

// Forward function for NFTs
const forwardNFT = async (oracleAddress) => {
  try {
    console.log('Forwarding NFT transfer to the blockchain...');
    let receipt = null;
    for (let i = 0; i < 3; i++) {
      const txResponse = await nftReceiverContract.requestMessage(
        oracleAddress
      );
      receipt = await txResponse.wait();
    }

    console.log('NFT transfer successful:', receipt);
    return { success: true, txHash: receipt };
  } catch (error) {
    console.error('Error forwarding NFT transfer:', error);
    return { success: false, error: error.message };
  }
};

// Endpoint to transfer a message
app.post('/transfer-message', async (req, res) => {
  const { oracleAddress } = req.body;
  if (!oracleAddress) {
    return res.status(400).send({ error: 'Missing oracleAddress' });
  }

  latestMessage = { oracleAddress }; // Store the message for retrieval
  const result = await forwardMessage(oracleAddress);

  if (result.success) {
    res.status(200).send({
      status: 'success',
      message: 'Message forwarded successfully',
      txHash: result.txHash,
    });
  } else {
    res.status(500).send({
      status: 'error',
      message: 'Failed to forward message',
      error: result.error,
    });
  }
});

// Endpoint to transfer tokens
app.post('/transfer-token', async (req, res) => {
  const { receiver, amount } = req.body;
  if (!receiver || !amount) {
    return res.status(400).send({ error: 'Missing receiver or amount' });
  }

  latestTokenMessage = { receiver, amount }; // Store the message for retrieval
  const result = await forwardToken(receiver, amount);

  if (result.success) {
    res.status(200).send({
      status: 'success',
      message: 'Token transferred successfully',
      txHash: result.txHash,
    });
  } else {
    res.status(500).send({
      status: 'error',
      message: 'Failed to transfer token',
      error: result.error,
    });
  }
});

app.post('/transfer-nft', async (req, res) => {
  try {
    // Extract data from the request body
    const { ChainID, Receiver, TokenID, MetadataURI } = req.body;

    // Validate the received data
    if (!ChainID || !Receiver || !TokenID || !MetadataURI) {
      console.error('Invalid payload received:', req.body);
      return res
        .status(400)
        .send({ error: 'Invalid payload. Missing required fields.' });
    }

    // Log the received data
    console.log('Data received from Chainlink job:');
    console.log(`ChainID: ${ChainID}`);
    console.log(`Receiver: ${Receiver}`);
    console.log(`TokenID: ${TokenID}`);
    console.log(`MetadataURI: ${MetadataURI}`);

    // Store the latest received message
    latestNftMessage = {
      tokenId: TokenID,
      receiver: Receiver,
      tokenURI: MetadataURI,
    };

    const result = await forwardNFT(oracleAddress);
    if (result.success) {
      return res
        .status(200)
        .send({ status: 'success', message: 'Data processed successfully' });
    } else {
      res.status(500).send({
        message: 'Data processed and stored, but forwarding failed',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error processing the request:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Endpoint to retrieve the latest message
app.get('/receiver', (req, res) => {
  if (!latestMessage) {
    return res.status(404).send('No message available');
  }
  console.log(latestMessage);
  res.status(200).json(latestMessage);
});

// Endpoint to retrieve the latest token transfer details
app.get('/receiver-token', (req, res) => {
  if (!latestTokenMessage) {
    return res.status(404).send('No token transfer details available');
  }
  res.status(200).json(latestTokenMessage);
});

app.get('/receiver-nft', (req, res) => {
  if (!latestNftMessage) {
    return res.status(404).send('No message available');
  }
  console.log(latestNftMessage);
  res.status(200).json(latestNftMessage);
});

app.listen(8000, () => console.log('Bridge server running on port 8000'));
