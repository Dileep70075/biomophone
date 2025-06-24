import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./ChatUi.scss";

const userData = JSON.parse(localStorage.getItem("user")) || {};
const { token, user } = userData || {};
const { id: userId } = user || {};

const ChatUI = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to the socket server
    const newSocket = io(`${import.meta.env.VITE_API_URL}`, {
      query: { token },
    });
    setSocket(newSocket);

    // Fetch messages for the conversation
    fetch(
      `${import.meta.env.VITE_API_URL}/api/chat/messages/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then(setMessages);

    // Listen for incoming messages
    newSocket.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]);
    });

    return () => newSocket.close();
  }, [conversationId, token]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      conversationId,
      senderId: userId,
      content: newMessage,
    };

    socket.emit("sendMessage", messageData);
    console.log("Sent message:", messageData);
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    // Handle file upload here
    console.log("File uploaded:", file);
  };

  const handleVoiceCall = () => {
    alert("Voice call feature coming soon!");
  };

  const handleVideoCall = () => {
    alert("Video call feature coming soon!");
  };

  const handleMicInput = () => {
    alert("Voice input feature coming soon!");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat with User</h3>
        <div className="chat-actions">
          <button onClick={handleVoiceCall}>📞</button>
          <button onClick={handleVideoCall}>📹</button>
          <input
            type="file"
            id="file-upload"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload">📎</label>
          <button onClick={handleMicInput}>🎤</button>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.senderId === userId ? "self" : "other"
            }`}
          >
            <p>
              <strong>{msg.senderId === userId ? "You" : "User"}:</strong>{" "}
              {msg.content}
            </p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatUI;
