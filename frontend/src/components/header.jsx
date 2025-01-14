import React from 'react';
import '../componentStyles/header.css';
import connectWallet from '../utils/connectWallet';
import { useNavigate } from 'react-router-dom';

const Header = ({ setFromChain, setFromAccount }) => {
  const handleClick = (e) => {
    e.preventDefault();
    window.open('/slither', '_blank', 'noopener,noreferrer');
  };
  return (
    <header className='header'>
      <div className='logo'>CrossChainX</div>
      <nav className='nav-links'>
        <button className='nav-btn' onClick={handleClick}>
          Contract Analysis
        </button>
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
