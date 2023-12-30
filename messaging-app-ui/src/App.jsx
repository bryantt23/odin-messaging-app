import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Messages from '../components/Messages';
import Header from '../components/Header';
import Login from '../components/Login';
import React, { useState, useEffect } from 'react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt'));

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
    <Router>
      <Header token={token} setToken={setToken} />
      <Routes>
        <Route path="/" element={<Messages token={token} />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
      </Routes>
    </Router>
  );
}

export default App;
