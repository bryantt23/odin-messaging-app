import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
    const [token, setToken] = useState(localStorage.getItem('jwt'));

    const signOut = () => {
        localStorage.removeItem('jwt');
        setToken(null); // Update the token state to null on sign out
    };

    // Moved the button rendering logic directly into the return statement
    const renderButton = token ? (
        <button onClick={signOut}>Sign out</button>
    ) : (
        <Link to="/login">Login</Link>
    );

    useEffect(() => {
        // Update token state whenever localStorage changes
        const handleStorageChange = () => {
            setToken(localStorage.getItem('jwt'));
        };

        window.addEventListener('storage', handleStorageChange);

        // Clean up the listener
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <header className="header">
            <nav className="nav">
                <ul className="nav-list">
                    <li className="nav-item"><Link to="/">Home</Link></li>
                    <li className="nav-item">{renderButton}</li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
