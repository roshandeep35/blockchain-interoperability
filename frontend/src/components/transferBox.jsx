import { useState } from 'react';
import '../componentStyles/transferBox.css';
import { switchNetwork } from '../utils/connectWallet';

const TransferBox = ({
  fromChain,
  setFromChain,
  fromAccount,
  setFromAccount,
  toChain,
  setToChain,
  toAccount,
  setToAccount,
  accounts,
  setAccounts,
}) => {
  const { network1, setNetwork1 } = useState('');
  const { network2, setNetwork2 } = useState('');
  const { account1, setAcccount1 } = useState('');
  const { account2, setAcccount2 } = useState('');

  const changeChain = async (e) => {
    setFromChain(e.target.value);
    await switchNetwork(e.target.value);
  };

  return (
    <div className='from-to-inputs'>
      <div className='from'>
        <label>From:</label>
        <select value={fromChain} onChange={(e) => changeChain(e)}>
          <option value='0x1'>Ethereum Mainnet</option>
          <option value='0xaa36a7'>Sepolia</option>
          <option value='0xe708'>Linea</option>
          <option value='0x539'>Fil Chain</option>
          <option value='0x53a'>Finova Chain</option>
        </select>
        <span></span>
        <label htmlFor='source-account'> Source Account:</label>

        <select
          value={fromAccount}
          onChange={(e) => setFromAccount(e.target.value)}
        >
          <option value='0x9761c10068D99D96f6135DC175fF2bFC6B504545'>
            Account 1
          </option>
          <option value='0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'>
            Account 2
          </option>
        </select>
      </div>
      <div className='to'>
        <label>To:</label>
        <select value={toChain} onChange={(e) => setToChain(e.target.value)}>
          <option value='0x1'>Ethereum Mainnet</option>
          <option value='0xaa36a7'>Sepolia</option>
          <option value='0xe708'>Linea</option>
          <option value='0x539'>Fil Chain</option>
          <option value='0x53a'>Finova Chain</option>
        </select>
        <span></span>
        <label htmlFor='target-account'>Target Account:</label>
        <select
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
        >
          <option value='0x9761c10068D99D96f6135DC175fF2bFC6B504545'>
            Account 1
          </option>
          <option value='0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'>
            Account 2
          </option>
        </select>
      </div>
    </div>
  );
};
export default TransferBox;
