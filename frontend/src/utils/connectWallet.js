import { ethers } from 'ethers';

const connectWallet = async (setFromAccount, setFromChain) => {
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
    const res = await provider.send('eth_requestAccounts', []);
    console.log(res);

    //fetch the network it is connected to
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    setFromChain(chainId);
    console.log('Current Network Chain ID:', chainId);

    // fetch the account in meta
    const signer = await provider.getSigner();
    console.log(signer);
    const address = await signer.getAddress();
    setFromAccount(address);
    console.log(address);
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
  }
};

const switchNetwork = async (chainId) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainId }], // Chain ID must be in hexadecimal
    });
    console.log(`Switched to network with chainId: ${chainId}`);
  } catch (error) {
    if (error.code === 4902) {
      console.log('Network not found in MetaMask. Prompting user to add it.');
      // Optionally add the network if it doesn't exist
    } else {
      console.error('Error switching networks:', error);
    }
  }
};

const requestAccount = async () => {
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    console.log('User selected account:', accounts[0]);
    // Update the connected account in your app
    document.getElementById(
      'accountDisplay'
    ).innerText = `Connected Wallet: ${accounts[0]}`;
  } catch (error) {
    console.error('Error requesting account access:', error);
  }
};

export default connectWallet;
export { switchNetwork };
