const SuccessMessage = ({ show, onClose }) => {
    if (!show) return null;

    return (
        <div className="success-message">
            <p>Transfer Successful!</p>
            <button onClick={onClose}>Close</button>
        </div>
    );
};
export default SuccessMessage;