export const TransferTypeSelector = ({ selectedType, setSelectedType }) => {
    return (
        <div className="transfer-type-selector">
            <button onClick={() => setSelectedType('message')} className={selectedType === 'message' ? 'active' : ''}>Message</button>
            <button onClick={() => setSelectedType('token')} className={selectedType === 'token' ? 'active' : ''}>Token</button>
            <button onClick={() => setSelectedType('nft')} className={selectedType === 'nft' ? 'active' : ''}>NFT</button>
        </div>
    );
};