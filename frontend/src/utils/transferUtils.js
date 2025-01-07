import {
  getNftSenderContract,
  getMessageSenderContract,
} from './contractUtils';

const oracleAddress = '0x2E983A1Ba5e8b38AAAeC4B440B9dDcFBf72E15d1';

const handleNftTransfer = async ({ toAccount, tokenId }) => {
  const contract = await getNftSenderContract();
  if (!contract) return;

  try {
    const tx = await contract.lockAndSendNFT(
      oracleAddress,
      1338,
      toAccount,
      tokenId
    );
    await tx.wait();
  } catch (err) {
    console.error('Error sending nft: ', err);
  }
};

const handleMessageTransfer = async ({ toAccount, message }) => {
  const contract = await getMessageSenderContract();
  if (!contract) {
    console.log('contract instance not formed');
    return;
  }
  console.log('after contract instance is formed');
  try {
    const tx = await contract.sendMessage(
      oracleAddress,
      1338,
      toAccount,
      message
    );
    console.log('After send message function is called');
    await tx.wait();
  } catch (err) {
    console.error('Error sending message: ', err);
  }
};

const handleTokenTransfer = async ({}) => {
  const contract = await getMessageSenderContract();
};

export { handleNftTransfer, handleMessageTransfer };
