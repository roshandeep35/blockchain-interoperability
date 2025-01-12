import React from 'react';
import '../componentStyles/confirmationPopup.css';

export const ConfirmationPopup = ({ show, onClose, onConfirm, details }) => {
  if (!show) return null;

  return (
    <div className='confirmation-popup'>
      <div className='popup-content'>
        <h3>Transaction Details</h3>
        <p>
          <strong>Transfer Type:</strong> {details.type}
        </p>
        <p>
          <strong>From Chain:</strong>{' '}
          {details.fromChain === '0x539' ? 'Chain 1' : 'Chain 2'}
        </p>
        <p>
          <strong>From Account:</strong> {details.fromAccount}
        </p>
        <p>
          <strong>To Chain:</strong>{' '}
          {details.toChain === '0x539' ? 'Chain 1' : 'Chain 2'}
        </p>
        <p>
          <strong>To Account:</strong> {details.toAccount}
        </p>
        {details.selectedType === 'message' && (
          <p>
            <strong>Message:</strong> {details.message}
          </p>
        )}
        {details.selectedType === 'token' && (
          <>
            <p>
              <strong>Amount:</strong> {details.amount}
            </p>
            <p>
              <strong>Token Address:</strong> {details.tokenAddress}
            </p>
          </>
        )}
        {details.selectedType === 'nft' && (
          <p>
            <strong>NFT Address:</strong> {details.nftAddress}
          </p>
        )}

        <div className='buttons'>
          <button onClick={onConfirm}>Confirm Transfer</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
