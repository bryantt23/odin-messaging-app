import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client'

const ENDPOINT = 'http://localhost:3000/'

function Messages() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

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
            <form>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)}></input>
                <input type="submit" onClick={handleSubmit}></input>
            </form>
        </div>
    );
}

export default Messages;
