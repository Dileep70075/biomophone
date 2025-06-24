import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { checkAuthentication } from "../../services/authService/auth-service"; // Import checkAuthentication
import "./CommunityDetails.scss";

const CommunityDetail = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]); // State for communities

  useEffect(() => {
    console.log("Community ID:", id);
    const fetchCommunity = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_MY_API_URL}/api/communities/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch community details");
        const data = await response.json();
        setCommunity(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_MY_API_URL}/api/communities/${id}/messages`
        );
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCommunity(), fetchMessages()]);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleAddChannelClick = async () => {
    try {
      const isAuthenticated = checkAuthentication();
      if (!isAuthenticated) {
        throw new Error("User is not authenticated.");
      }
      const response = await fetch(
        `${import.meta.env.VITE_APP_MY_API_URL}/api/communities`
      );
      const data = await response.json();
      setCommunities(data);
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="community-detail-container">
      <div className="header-section">
        <div className="community-info">
          <h1>{community.name}</h1>
          <p>{community.description || "No description available."}</p>
        </div>
      </div>

      <div className="messages-section">
        <h2>Messages</h2>
        {messages.length ? (
          <ul>
            {messages.map((message) => (
              <li key={message.id}>
                <div className="message-item">
                  <div className="avatar">
                    <img
                      src={message.senderAvatar || "/default-avatar.png"}
                      alt={message.sender}
                    />
                  </div>
                  <div className="message-content">
                    <p>
                      <strong>{message.sender}</strong>
                    </p>
                    <p>{message.text}</p>
                    <span>{new Date(message.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No messages available</p>
        )}
      </div>

      <button className="add-channel-btn" onClick={handleAddChannelClick}>
        +
      </button>

      <div className="communities-section">
        <h2>Communities</h2>
        {communities.length ? (
          <ul>
            {communities.map((community) => (
              <li key={community.id}>
                <h3>{community.name}</h3>
                <p>{community.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No communities available</p>
        )}
      </div>
    </div>
  );
};

export default CommunityDetail;
