import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import "../styles/Chat.css";

const socket = io(import.meta.env.VITE_APP_URL);

const Chat: React.FC = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ sender: string, message: string }[]>([]);
    const [username, setUsername] = useState("");
    const [messageHistory, setMessageHistory] = useState<{ time: number }[]>([]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_APP_URL}/api/user/me`, {
                withCredentials: true,
            });
            setUsername(response.data.username);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUsername("Anonymous");
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        socket.on("receiveMessage", (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    const sendMessage = () => {
        if (!username) fetchUserProfile();
        if (message.trim()) {
            const currentTime = Date.now();
            const recentMessages = messageHistory.filter(msg => currentTime - msg.time < 13000);

            if (recentMessages.length < 10) {
                socket.emit("sendMessage", { sender: username, message });
                setMessage("");
                setMessageHistory([...recentMessages, { time: currentTime }]);
            } else {
                alert("WOW! Slow down there, cowboy! You're sending messages too fast.");
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2 className="chat-title">Live Chat</h2>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="no-messages">No messages</div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`chat-message ${msg.sender === username ? "sent" : "received"}`}
                        >
                            <span className="chat-sender">{msg.sender}:</span> {msg.message}
                        </div>
                    ))
                )}
            </div>

            <div className="chat-input-container">
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
                <button onClick={sendMessage} className="chat-send-button" disabled={!message.trim()}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
