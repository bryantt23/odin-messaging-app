import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/login', { name, password });
            localStorage.setItem("jwt", response.data.token);
            navigate('/');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                alert('Authentication failed');
            } else {
                console.error('Login error:', error);
            }
        }
    };

    return (<form onSubmit={handleLogin} className="login-form">
        <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-name"
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-password"
        />
        <button type="submit" className="login-button">Login</button>
    </form>
    );
}

export default Login;
