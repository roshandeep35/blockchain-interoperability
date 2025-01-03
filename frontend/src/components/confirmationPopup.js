export const ConfirmationPopup = ({ show, details, onClose, onConfirm }) => {
    if (!show) return null;

    return (
        <div className="confirmation-popup">
            <h3>Confirm Transfer</h3>
            <pre>{JSON.stringify(details, null, 2)}</pre>
            <button onClick={onConfirm}>Confirm</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};