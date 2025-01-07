import { ethers } from 'ethers';
import messageSenderABI from '../utils/messageSender';
import tokenSenderABI from '../utils/tokenSender';
import nftSenderABI from '../utils/nftSender';
import dummyLinkABI from '../utils/dummyLink';
import dummyNftABI from '../utils/dummyNft';

const MESSAGE_SENDER_CONTRACT_ADDRESS =
  '0xBC9129Dc0487fc2E169941C75aABC539f208fb01';
const TOKEN_SENDER_CONTRACT_ADDRESS =
  '0x8cDbD76bB6Cf0293e07deEEEd460cf579873aF44';
const NFT_SENDER_CONTRACT_ADDRESS =
  '0xf5Ba2DBD8699EA196e66Bb980a28afcf8Cb759DC';
const DUMMY_LINK_CONTRACT_ADDRESS =
  '0x663F3ad617193148711d28f5334eE4Ed07016602';
const DUMMY_NFT_CONTRACT_ADDRESS = '0xfA7f76E6D34fd22dB308178eD57947e9b0d65593';

const getMessageSenderContract = async () => {
  if (!window.ethereum) {
    alert('Metamask is not installed');
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  //connect to the deployed contract
  const contract = new ethers.Contract(
    MESSAGE_SENDER_CONTRACT_ADDRESS,
    messageSenderABI,
    signer
  );
  return contract;
};

const getTokenSenderContract = async () => {
  if (!window.ethereum) {
    alert('Metamask is not installed');
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  //connect to the deployed contract
  const contract = new ethers.Contract(
    TOKEN_SENDER_CONTRACT_ADDRESS,
    tokenSenderABI,
    signer
  );
  return contract;
};

const getNftSenderContract = async () => {
  if (!window.ethereum) {
    alert('Metamask is not installed');
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  //connect to the deployed contract
  const contract = new ethers.Contract(
    NFT_SENDER_CONTRACT_ADDRESS,
    nftSenderABI,
    signer
  );
  return contract;
};

const getDummyLinkContract = async () => {
  if (!window.ethereum) {
    alert('Metamask is not installed');
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  //connect to the deployed contract
  const contract = new ethers.Contract(
    DUMMY_LINK_CONTRACT_ADDRESS,
    dummyLinkABI,
    signer
  );
  return contract;
};

const getDummyNftContract = async () => {
  if (!window.ethereum) {
    alert('Metamask is not installed');
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  //connect to the deployed contract
  const contract = new ethers.Contract(
    DUMMY_NFT_CONTRACT_ADDRESS,
    dummyNftABI,
    signer
  );
  return contract;
};

export {
  getMessageSenderContract,
  getTokenSenderContract,
  getNftSenderContract,
  getDummyLinkContract,
  getDummyNftContract,
};
