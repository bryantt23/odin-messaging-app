// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'

function Header() {
    return (
        <header className="header">
            <nav className="nav">
                <ul className="nav-list">
                    <li className="nav-item"><Link to="/">Home</Link></li>
                    <li className="nav-item"><Link to="/create-post">Signout or Register/Login</Link></li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
