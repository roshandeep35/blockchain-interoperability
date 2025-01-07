
import React, { useState } from 'react';
import { ConfirmationPopup } from './confirmationPopup';  // Assuming you have a separate component for the popup.
import TransferBox from './transferBox';
import SpecificInputs from './specificInputs';
import { TransferTypeSelector } from './transferTypeSelector';
import SuccessMessage from './successMessage';
import Header from './header';
import '../componentStyles/transferPage.css';
import Footer from './footer';
import TransferButton from './transferButton';

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
            ...(selectedType === 'nft' && { nftAddress }),
        };
        // Set the details here if you want to show them in the popup.
        setShowPopup(true);
    };

    const confirmTransfer = () => {
        setShowPopup(false);
        setShowSuccess(true);
    };

    const cancelTransfer = () => {
        setShowPopup(false);
    };

    return (
        <>
            <Header />
            <div className="transfer-page">
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
                    
                    <TransferButton  onClick={handleTransfer} />
                    
                </div>
                {showPopup && (
                    <ConfirmationPopup 
                        show={showPopup} 
                        onClose={cancelTransfer} 
                        onConfirm={confirmTransfer}
                        details={{
                            selectedType,
                            fromChain,
                            fromAccount,
                            toChain,
                            toAccount,
                            message,
                            amount,
                            tokenAddress,
                            nftAddress
                        }}
                    />
                )}
                <SuccessMessage show={showSuccess} onClose={() => setShowSuccess(false)} />
            </div>
            <Footer />
        </>
    );
};

export default TransferPage;

