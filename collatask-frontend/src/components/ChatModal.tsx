import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faHourglass } from '@fortawesome/free-solid-svg-icons';

import { ChatModalProps } from "../utils/interfaces";

import "../styles/Chat.css";

const socket = io(import.meta.env.VITE_APP_URL);

const Chat: React.FC<ChatModalProps> = ({ chat, onClose }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ sender: string, message: string, sent: boolean }[]>([]);
    const [username, setUsername] = useState("");
    const [messageHistory, setMessageHistory] = useState<{ time: number }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_APP_URL}/api/user/me`, {
                withCredentials: true,
            });
            setUsername(response.data.username);
            localStorage.setItem("username", response.data.username);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            const storedUsername = localStorage.getItem("username");
            if (storedUsername) {
                setUsername(storedUsername);
            } else {
                setUsername("Anonymous");
            }
        }
    };

    const checkRoom = async () => {
        if (!chat.room) {
            chat.room = window.location.pathname.split("/").pop();
        }
    };

    useEffect(() => {
        fetchUserProfile();
        checkRoom();
        socket.emit("joinRoom", chat.room);

        const unsentMessages = JSON.parse(localStorage.getItem("unsentMessages") || "[]");
        setMessages((prevMessages) => [
            ...prevMessages,
            ...unsentMessages.map((msg: { sender: string, message: string }) => ({ ...msg, sent: false })),
        ]);

        socket.on("historicalMessages", (historicalMessages) => {
            setMessages(historicalMessages.map((msg: { sender: string, message: string }) => ({ ...msg, sent: true })));
        });

        return () => {
            socket.off("historicalMessages");
        };
    }, [chat.room]);

    useEffect(() => {
        socket.on("receiveMessage", (data) => {
            if (data.sender === username) {
                return;
            }
            setMessages((prevMessages) => [...prevMessages, { ...data, sent: true }]);
        });

        socket.on("messageAck", (message) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.message === message.message ? { ...msg, sent: true } : msg
                )
            );

            const unsentMessages = JSON.parse(localStorage.getItem("unsentMessages") || "[]");
            const updatedUnsentMessages = unsentMessages.filter((msg: { message: string }) => msg.message !== message.message);
            localStorage.setItem("unsentMessages", JSON.stringify(updatedUnsentMessages));
        });

        return () => {
            socket.off("receiveMessage");
            socket.off("messageAck");
        };
    }, [username]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!username) fetchUserProfile();
        if (message.trim()) {
            const currentTime = Date.now();
            const recentMessages = messageHistory.filter((msg) => currentTime - msg.time < 13000);

            if (recentMessages.length < 10) {
                const newMessage = { sender: username, message, sent: false };
                setMessages((prevMessages) => [...prevMessages, newMessage]);

                const unsentMessages = JSON.parse(localStorage.getItem("unsentMessages") || "[]");
                unsentMessages.push(newMessage);
                localStorage.setItem("unsentMessages", JSON.stringify(unsentMessages));

                socket.emit("sendMessage", { sender: username, message, room: chat.room });
                setMessage("");
                setMessageHistory([...recentMessages, { time: currentTime }]);
            } else {
                alert("WOW! Slow down there, cowboy! You're sending messages way too fast.");
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chat-overlay">
            <div className="chat-content">
                <button className="close-btn" onClick={onClose}>×</button>
                <div className="chat-header">Chat with Team</div>
                <div className="chat-body">
                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="no-messages">No messages</div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`chat-message ${msg.sender !== username ? "received" : msg.sent ? "sent" : "unsent"}`}
                                >
                                    <span className="chat-sender">{msg.sender}:</span> {msg.message}
                                    {msg.sender === username && ((msg.sent && index === messages.length - 1) || !msg.sent) && (
                                        <span className="message-status">
                                            {msg.sent ? (
                                                <FontAwesomeIcon icon={faCheck} />
                                            ) : (
                                                <FontAwesomeIcon icon={faHourglass} />
                                            )}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <textarea
                        className="chat-input"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                </div>

                <div className="chat-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        onClick={sendMessage}
                        className="chat-send-button"
                        disabled={!message.trim()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
