import {
  getNftSenderContract,
  getMessageSenderContract,
  getTokenSenderContract,
} from './contractUtils';

const oracleAddress = '0x2E983A1Ba5e8b38AAAeC4B440B9dDcFBf72E15d1';

const handleNftTransfer = async (details, setShowSuccess) => {
  const { toAccount, tokenId } = details;
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
    setTimeout(() => {
      setShowSuccess(true);
    }, 10000);
  } catch (err) {
    console.error('Error sending nft: ', err);
  }
};

const handleMessageTransfer = async (details, setShowSuccess) => {
  const { toAccount, message } = details;
  const contract = await getMessageSenderContract();
  if (!contract) {
    console.log('contract instance not formed');
    return;
  }
  try {
    const tx = await contract.sendMessage(
      oracleAddress,
      1338,
      toAccount,
      message
    );
    console.log('After send message function is called', tx);

    const receipt = await tx.wait();
    console.log(receipt);
    setTimeout(() => {
      setShowSuccess(true);
    }, 10000);
  } catch (err) {
    console.error('Error sending message: ', err);
  }
};

const handleTokenTransfer = async (details, setShowSuccess) => {
  const { amount, tokenAddress, toAccount } = details;
  const contract = await getTokenSenderContract();
  if (!contract) return;
  console.log(typeof amount);
  const Amount = (parseFloat(amount) * Math.pow(10, 18)).toString();
  try {
    const tx = await contract.sendToken(
      oracleAddress,
      1338,
      toAccount,
      tokenAddress,
      Amount
    );
    console.log('After sendToken function is called');
    await tx.wait();
    setTimeout(() => {
      setShowSuccess(true);
    }, 10000);
  } catch (err) {
    console.error('Error sending token', err);
  }
};

export { handleNftTransfer, handleMessageTransfer, handleTokenTransfer };
