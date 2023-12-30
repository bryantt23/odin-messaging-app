import React, { useEffect, useState, useRef } from 'react';
import socketIOClient from 'socket.io-client'
import './ChatComponent.css'
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const ENDPOINT = 'http://localhost:3000/'

function ChatComponent({ token, userName }) {
    console.log("🚀 ~ file: ChatComponent.jsx:10 ~ ChatComponent ~ userName:", userName)
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null)
    const { user } = useParams()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        // Establish WebSocket connection
        const socket = socketIOClient(ENDPOINT)

        // Join the room with the current username
        socket.emit("joinRoom", { username: userName })

        // Listen for new private messages
        socket.on("newPrivateMessage", (message) => {
            setMessages((prevMessages) => [...prevMessages, message])
        })

        return () => socket.disconnect()
    }, [userName]);

    useEffect(() => {
        if (userName) {
            async function fetchData() {
                const query = new URLSearchParams({ userName, user }).toString();
                const url = `${ENDPOINT}messages?${query}`;
                const response = await fetch(url);
                const data = await response.json();
                setMessages(data);
            }
            fetchData();
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

        try {
            const response = await fetch(ENDPOINT + 'messages', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: text, recipientUsername: user })
            })
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setText("")
        } catch (error) {
            console.error('Error sending message:', error);
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
                                {message.username === userName ? (
                                    // If the message username is the current user, display as plain text
                                    <span className="message-title">{message.username}</span>
                                ) : (
                                    // Otherwise, display as a hyperlink
                                    <a href={`chat-with/${message.username}`} className="message-title">{message.username}</a>
                                )}
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