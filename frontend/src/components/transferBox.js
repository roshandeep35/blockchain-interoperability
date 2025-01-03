 const TransferBox = ({ fromChain, setFromChain, fromAccount, setFromAccount, toChain, setToChain, toAccount, setToAccount }) => {
    return (
        <div className="from-to-inputs">
            <div className="from">
                <label>From:</label>
                <select value={fromChain} onChange={(e) => setFromChain(e.target.value)}>
                    <option value="ethereum">Ethereum</option>
                    <option value="bnb">BNB Chain</option>
                </select>
                <input type="text" placeholder="Source Account" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} />
            </div>
            <div className="to">
                <label>To:</label>
                <select value={toChain} onChange={(e) => setToChain(e.target.value)}>
                    <option value="ethereum">Ethereum</option>
                    <option value="bnb">BNB Chain</option>
                </select>
                <input type="text" placeholder="Target Account" value={toAccount} onChange={(e) => setToAccount(e.target.value)} />
            </div>
        </div>
    );
};
export default TransferBox;