// export const ConfirmationPopup = ({ show, details, onClose, onConfirm }) => {
//     if (!show) return null;

//     return (
//         <div className="confirmation-popup">
//             <h3>Confirm Transfer</h3>
//             <pre>{JSON.stringify(details, null, 2)}</pre>
//             <button onClick={onConfirm}>Confirm</button>
//             <button onClick={onClose}>Cancel</button>
//         </div>
//     );
// };

import React from 'react';
import '../componentStyles/confirmationPopup.css'

export const ConfirmationPopup = ({ show, onClose, onConfirm, details }) => {
    if (!show) return null;

    return (
        <div className="confirmation-popup">
            <div className="popup-content">
                <h3>Transaction Details</h3>
                <p><strong>Transfer Type:</strong> {details.selectedType}</p>
                <p><strong>From Chain:</strong> {details.fromChain}</p>
                <p><strong>From Account:</strong> {details.fromAccount}</p>
                <p><strong>To Chain:</strong> {details.toChain}</p>
                <p><strong>To Account:</strong> {details.toAccount}</p>
                {details.selectedType === 'message' && <p><strong>Message:</strong> {details.message}</p>}
                {details.selectedType === 'token' && (
                    <>
                        <p><strong>Amount:</strong> {details.amount}</p>
                        <p><strong>Token Address:</strong> {details.tokenAddress}</p>
                    </>
                )}
                {details.selectedType === 'nft' && <p><strong>NFT Address:</strong> {details.nftAddress}</p>}

                <div className="buttons">
                    <button onClick={onConfirm}>Confirm Transfer</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};


