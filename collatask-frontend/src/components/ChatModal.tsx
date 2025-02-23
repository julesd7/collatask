import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import { ChatModalProps } from "../utils/interfaces";

import "../styles/Chat.css";
import "../styles/Modal.css";

const socket = io(import.meta.env.VITE_APP_URL);

const Chat: React.FC<ChatModalProps> = ({chat, onClose}) => {
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

    const checkRoom = async () => {
        if (!chat.room) {
            chat.room = window.location.pathname.split("/").pop();
        }
    }

    useEffect(() => {
        fetchUserProfile();
        checkRoom();
        socket.emit("joinRoom", chat.room);
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
                socket.emit("sendMessage", { sender: username, message, room: chat.room });
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
        <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="modal-header">Chat with team</div>
        <div className="modal-body">
        <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            />
        </div>
        
        <div className="modal-footer">
        <button onClick={sendMessage} className="chat-send-button" disabled={!message.trim()}>Send</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
    );
};

export default Chat;
