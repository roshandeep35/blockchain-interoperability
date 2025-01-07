// import ethers from 'ethers';
const { ethers } = require('ethers');

const connectWallet = async () => {
  try {
    if (typeof window.ethereum === 'undefined') {
      alert(
        'MetaMask is not installed. Please install it to use this feature.'
      );
      console.log('MetaMask not detected.');
      return;
    }

    console.log('MetaMask detected!');

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);

    const signer = provider.getSigner();
    const address = await signer.getAddress();

    document.getElementById(
      'accountDisplay'
    ).innerText = `Connected Wallet: ${address}`;
    console.log('Connected Wallet Address:', address);
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
  }
};

export default connectWallet;
