import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Messages from '../components/Messages';
import Header from '../components/Header';
import Login from '../components/Login';
import ChatComponent from '../components/ChatComponent';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";


function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt'));
  const [userName, setUserName] = useState(null)

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

  useEffect(() => {
    if (token) {
      const decodedHeader = jwtDecode(token);
      setUserName(decodedHeader.name)
    }
    else {
      setUserName(null)
    }
  }, [token])

  return (
    <Router>
      <Header token={token} setToken={setToken} userName={userName} />
      <Routes>
        <Route path="/" element={<Messages token={token} userName={userName} />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/chat-with/:user" element={<ChatComponent token={token} userName={userName} />} />
      </Routes>
    </Router>
  );
}

export default App;
