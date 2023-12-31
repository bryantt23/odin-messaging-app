import React, { useEffect, useState, useRef } from 'react';
import socketIOClient from 'socket.io-client'
import './ChatComponent.css'
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { fetchMessages, scrollToBottom, sendMessage } from './utils';

const ENDPOINT = 'http://localhost:3000/'

function ChatComponent({ token, userName }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null)
    const { user } = useParams()

    useEffect(() => {
        scrollToBottom(messagesEndRef)
    }, [messages])

    useEffect(() => {
        // Establish WebSocket connection
        const socket = socketIOClient(ENDPOINT)

        // Join the room with the current username
        socket.emit("joinPrivateRoom", { username: userName })

        // Listen for new private messages
        socket.on("newPrivateMessage", (message) => {
            const formattedMessage = {
                content: message.content,
                // Assuming the server sends the sender's username as 'sender'
                username: message.sender
            };
            if (formattedMessage.username) {
                setMessages((prevMessages) => [...prevMessages, formattedMessage]);
            }
        })

        return () => socket.disconnect()
    }, [userName]);

    useEffect(() => {
        if (userName) {
            fetchMessages(ENDPOINT, { userName, user }).then(data => setMessages(data));
        }
    }, [userName, user]);


    const handleSubmit = async (e) => {
        e.preventDefault()

        const socket = socketIOClient(ENDPOINT)

        // Emit the private message
        socket.emit("privateMessage", {
            content: text,
            sender: userName,
            recipient: user
        })

        const success = await sendMessage(ENDPOINT, token, text, user);
        if (success) {
            setText("");
        }
    }

    const form = token ? (
        <form onSubmit={handleSubmit}>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)}></input>
            <button type="submit">Send</button>
        </form>
    ) : (
        <p>You must <Link to="/login">Login</Link> to chat</p>
    );

    return (
        <div className="messages-container">
            <h2 className="sticky-header messages-title">Chat with {user}</h2>
            <div className="main-content">
                {messages.length > 0 ? (
                    <ul className="message-list">
                        {messages.map(message => (
                            <li key={message._id} className="message-item">
                                <span className="message-title">{message.username}</span>
                                <p className="message-body">{message.content}</p>
                            </li>
                        ))}
                        <div ref={messagesEndRef} />
                    </ul>
                ) : (
                    <p>No messages available.</p>
                )}
                {form}
            </div>
        </div>
    );
}

export default ChatComponent;