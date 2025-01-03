import React, { useState } from 'react';

import { ConfirmationPopup } from './confirmationPopup';
import  TransferBox from './transferBox'
import SpecificInputs from './specificInputs';
import { TransferTypeSelector } from './transferTypeSelector';
import SuccessMessage from './successMessage';
import Header from './header';
import '../componentStyles/transferPage.css'


const TransferPage = () => {
    const [selectedType, setSelectedType] = useState('message');
    const [fromChain, setFromChain] = useState('');
    const [fromAccount, setFromAccount] = useState('');
    const [toChain, setToChain] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [message, setMessage] = useState('');
    const [amount, setAmount] = useState('');
    const [tokenAddress, setTokenAddress] = useState('');
    const [nftAddress, setNftAddress] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [transferDetails, setTransferDetails] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    const handleTransfer = () => {
        const details = {
            type: selectedType,
            fromChain,
            fromAccount,
            toChain,
            toAccount,
            ...(selectedType === 'message' && { message }),
            ...(selectedType === 'token' && { amount, tokenAddress }),
            ...(selectedType === 'nft' && { nftAddress })
        };
        setTransferDetails(details);
        setShowPopup(true);
    };

    const confirmTransfer = () => {
        setShowPopup(false);
        setShowSuccess(true);
    };

    return (
        <div className="transfer-page">
            <Header></Header>
            <TransferTypeSelector selectedType={selectedType} setSelectedType={setSelectedType} />
            <div className="transfer-box">
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
                    nftAddress={nftAddress}
                    setNftAddress={setNftAddress}
                />
                <button onClick={handleTransfer}>Transfer</button>
            </div>
            <ConfirmationPopup show={showPopup} details={transferDetails} onClose={() => setShowPopup(false)} onConfirm={confirmTransfer} />
            <SuccessMessage show={showSuccess} onClose={() => setShowSuccess(false)} />
        </div>
    );
};

export default TransferPage;