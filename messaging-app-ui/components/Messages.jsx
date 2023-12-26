import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Messages() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/messages')
            .then(response => response.json())
            .then(data => setMessages(data))
            .catch(error => console.error('Error fetching messages:', error));
    }, []);

    return (
        <div className="messages-container">
            <h2 className="messages-title">All Messages</h2>
            {messages.length > 0 ? (
                <ul className="message-list">
                    {messages.map(message => (
                        <li key={message._id} className="message-item">
                            <h3 className="message-title">{message.username}</h3>
                            <p className="message-body">{message.content}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No messages available.</p>
            )}
        </div>
    );
}

export default Messages;
