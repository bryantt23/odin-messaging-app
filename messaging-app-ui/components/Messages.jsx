import React, { useEffect, useState, useRef } from 'react';
import socketIOClient from 'socket.io-client'
import './Messages.css'
import { Link } from 'react-router-dom';

const ENDPOINT = 'http://localhost:3000/'

function Messages({ token }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        async function fetchData() {
            const response = await getMessages()
            setMessages(response)
        }
        fetchData();
        // Establish WebSocket connection
        const socket = socketIOClient(ENDPOINT)
        // Listen for new messages
        socket.on("newMessage", (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage])
        })

        return () => socket.disconnect()
    }, []);

    const getMessages = async () => {
        try {
            const response = await fetch(ENDPOINT + 'messages')
            return response.json()

        } catch (error) {
            console.error('Error fetching messages:', error)
            return error
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch(ENDPOINT + 'messages', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: text })
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
            <h2 className="sticky-header messages-title">All Messages</h2>
            <div className="main-content">

                {messages.length > 0 ? (
                    <ul className="message-list">
                        {messages.map(message => (
                            <li key={message._id} className="message-item">
                                <h3 className="message-title">{message.username}</h3>
                                <p className="message-body">{message.content}</p>
                            </li>
                        ))}
                        {/* Invisible element for scrolling */}
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

export default Messages;
