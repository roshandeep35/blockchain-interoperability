import React from 'react';
import '../componentStyles/header.css';
import connectWallet from '../utils/connectWallet';

const Header = ({ setFromChain, setFromAccount }) => {
  return (
    <header className='header'>
      <div className='logo'>CrossChainX</div>
      <nav className='nav-links'>
        <button className='nav-btn'>History</button>
        <button
          className='nav-btn'
          onClick={() => connectWallet(setFromAccount, setFromChain)}
        >
          Connect Wallet
        </button>
        <button className='hamburger'>☰</button>
      </nav>
    </header>
  );
};

export default Header;
