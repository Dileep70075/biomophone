import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Communitylist.scss";
import CommunityDetail from "../CommunityDetail/CommunityDetails";

const CommunityList = () => {
  const [communities, setCommunities] = useState([]); // Ensure initial state is an empty array
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        // Retrieve the token from local storage
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;

        if (!token) {
          throw new Error("Token is missing. Please provide a valid token.");
        }

        const response = await fetch(
          `${import.meta.env.VITE_APP_MY_API_URL}/api/communities`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();
        if (Array.isArray(data)) {
          setCommunities(data); // Ensure data is an array before setting state
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunities();
  }, []);

  const handleAddChannelClick = () => {
    navigate("/community/create");
  };

  const handleCommunityClick = (id) => {
    navigate(`/community/${id}`);
  };

  return (
    <div className="community-list-container">
      <div className="sidebar">
        <h1>Channels</h1>
        <button className="add-channel-btn" onClick={handleAddChannelClick}>
          +
        </button>
      </div>
      <div className="main-content">
        <div className="search-bar">
          <input type="text" placeholder="Search channels..." />
        </div>
        <ul className="community-list" >
          {communities.map((community) => (
            <li
              key={community.id}
              className="community-item"
              onClick={() => handleCommunityClick(community.id)}
            >
              <div className="community-avatar">
                <img
                  src={community.avatarUrl || "/default-avatar.png"}
                  alt={community.name}
                />
              </div>
              <div className="community-details">
                <h2>{community.name}</h2>
                <p>{community.description || "No description available"}</p>
                <span>{community.date}</span>
              </div>
            </li>
          ))}
        </ul>

        {selectedCommunity && (
          <CommunityDetail community={selectedCommunity} />
        )}
      </div>
    </div>
  );
};

export default CommunityList;
