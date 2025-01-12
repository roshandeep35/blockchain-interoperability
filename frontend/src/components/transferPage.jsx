import React, { useState } from 'react';
import { ConfirmationPopup } from './confirmationPopup';
import TransferBox from './transferBox.jsx';
import SpecificInputs from './specificInputs';
import { TransferTypeSelector } from './transferTypeSelector';
import SuccessMessage from './successMessage';
import Header from './header';
import '../componentStyles/transferPage.css';
import Footer from './footer';
import TransferButton from './transferButton';

import {
  handleMessageTransfer,
  handleNftTransfer,
  handleTokenTransfer,
} from '../utils/transferUtils.js';

const TransferPage = () => {
  const [selectedType, setSelectedType] = useState('message');
  const [fromChain, setFromChain] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toChain, setToChain] = useState('');
  const [toAccount, setToAccount] = useState(
    '0x9761c10068D99D96f6135DC175fF2bFC6B504545'
  );
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState(
    '0x663F3ad617193148711d28f5334eE4Ed07016602'
  );
  const [tokenId, setTokenId] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [details, setDetails] = useState(null);

  const [accounts, setAccounts] = useState({});

  const handleTransfer = () => {
    console.log(selectedType);
    setDetails({
      type: selectedType,
      fromChain,
      fromAccount,
      toChain,
      toAccount,
      ...(selectedType === 'message' && { message }),
      ...(selectedType === 'token' && { amount, tokenAddress }),
      ...(selectedType === 'nft' && { tokenId }),
    });
    console.log(details);
    setShowPopup(true);
  };

  const confirmTransfer = () => {
    if (selectedType === 'nft') {
      handleNftTransfer(details, setShowSuccess);
    }
    if (selectedType === 'message') {
      handleMessageTransfer(details, setShowSuccess);
    }
    if (selectedType === 'token') {
      handleTokenTransfer(details, setShowSuccess);
    }
    setShowPopup(false);
  };

  const cancelTransfer = () => {
    setShowPopup(false);
  };

  return (
    <>
      <Header setFromChain={setFromChain} setFromAccount={setFromAccount} />
      <div className='transfer-page'>
        <TransferTypeSelector
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />
        <div className='transfer-box'>
          <TransferBox
            fromChain={fromChain}
            setFromChain={setFromChain}
            fromAccount={fromAccount}
            setFromAccount={setFromAccount}
            toChain={toChain}
            setToChain={setToChain}
            toAccount={toAccount}
            setToAccount={setToAccount}
            accounts={accounts}
            setAccounts={setAccounts}
          />
          <SpecificInputs
            selectedType={selectedType}
            message={message}
            setMessage={setMessage}
            amount={amount}
            setAmount={setAmount}
            tokenAddress={tokenAddress}
            setTokenAddress={setTokenAddress}
            tokenId={tokenId}
            setTokenId={setTokenId}
          />
          <TransferButton onClick={handleTransfer} />
        </div>
        {showPopup && (
          <ConfirmationPopup
            show={showPopup}
            onClose={cancelTransfer}
            onConfirm={confirmTransfer}
            details={details}
          />
        )}
        <SuccessMessage
          show={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
      </div>
      <Footer />
    </>
  );
};

export default TransferPage;
