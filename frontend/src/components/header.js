import React from 'react';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">MyLogo</div>
            <nav>
                <button>History</button>
                <button>Connect Wallet</button>
                <button className="hamburger">☰</button>
            </nav>
        </header>
    );
};
export default  Header;