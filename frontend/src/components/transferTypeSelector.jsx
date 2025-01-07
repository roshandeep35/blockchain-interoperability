import '../componentStyles/transferTypeSelector.css'
export const TransferTypeSelector = ({ selectedType, setSelectedType }) => {
  return (
    
      <div className="transfer-type-selector">
        <div>
          <label>
            <input
              type="radio"
              name="radio"
              checked={selectedType === 'message'}
              onChange={() => setSelectedType('message')}
            />
            <span>Message</span>
          </label>
          <label>
            <input
              type="radio"
              name="radio"
              checked={selectedType === 'nft'}
              onChange={() => setSelectedType('nft')}
            />
            <span>NFT</span>
          </label>
          <label>
            <input
              type="radio"
              name="radio"
              checked={selectedType === 'token'}
              onChange={() => setSelectedType('token')}
            />
            <span>Token</span>
          </label>
        </div>
      </div>
    
  );
};
