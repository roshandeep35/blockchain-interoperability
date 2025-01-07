import React, { useState } from 'react';

import { ConfirmationPopup } from './confirmationPopup';
import TransferBox from './transferBox.jsx';
import SpecificInputs from './specificInputs';
import { TransferTypeSelector } from './transferTypeSelector';
import SuccessMessage from './successMessage';
import Header from './header';
import '../componentStyles/transferPage.css';
import Footer from './footer';

import {
  handleMessageTransfer,
  handleNftTransfer,
} from '../utils/transferUtils.js';

const TransferPage = () => {
  const [selectedType, setSelectedType] = useState('message');
  const [fromChain, setFromChain] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toChain, setToChain] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTransfer = () => {
    console.log(selectedType);
    const details = {
      type: selectedType,
      fromChain,
      fromAccount,
      toChain,
      toAccount,
      ...(selectedType === 'message' && { message }),
      ...(selectedType === 'token' && { amount, tokenAddress }),
      ...(selectedType === 'nft' && { tokenId }),
    };
    if (selectedType === 'token') {
      handleNftTransfer(details);
    }
    if (selectedType === 'message') {
      handleMessageTransfer(details);
    }
    setShowPopup(true);
  };

  const confirmTransfer = () => {
    setShowPopup(false);
    setShowSuccess(true);
  };

  return (
    <>
      <Header />
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
          <button onClick={handleTransfer}>Transfer</button>
        </div>
        {/* <ConfirmationPopup
          show={showPopup}
          onClose={() => setShowPopup(false)}
          onConfirm={confirmTransfer}
        /> */}
        <SuccessMessage
          show={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
      </div>
      <Footer></Footer>
    </>
  );
};

export default TransferPage;
