const SpecificInputs = ({
  selectedType,
  message,
  setMessage,
  amount,
  setAmount,
  tokenAddress,
  setTokenAddress,
  tokenId,
  setTokenId,
}) => {
  return (
    <div className='specific-inputs'>
      {selectedType === 'message' && (
        <input
          type='text'
          placeholder='Message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      )}
      {selectedType === 'token' && (
        <>
          <input
            type='number'
            placeholder='Amount'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type='text'
            placeholder='Token Address'
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
        </>
      )}
      {selectedType === 'nft' && (
        <input
          type='number'
          placeholder='Token Id'
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
      )}
    </div>
  );
};
export default SpecificInputs;
