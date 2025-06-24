import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./StoryView.scss";
import Stories from "./Stories";

const StoryView = () => {
  const [stories, setStories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user"));
  if (!userData || !userData.token || !userData.user) {
    console.error("User data missing from localStorage");
  }
  const { token, user } = userData || {};
  const { id: userId } = user || {};

  // console.log('User ID:', userId);
  // console.log('Token:', token);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData.token || !userData.user) {
          console.error("User data missing from localStorage");
          return;
        }

        const { token, user } = userData;
        const { id: userId } = user;

        // console.log("User ID:", userId);
        // console.log("Token:", token);

        if (!token || !userId) {
          console.error("Authorization token or user ID is missing.");
          return;
        }

        // const response = await axios.get(
        //   `${import.meta.env.VITE_API_URL}/api/stories/`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/stories/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.warn("Fetched stories:", response.data);
      } catch (error) {
        if (error.response) {
          console.error("API Response Error:", error.response.data);
        } else {
          console.error("Error fetching stories:", error);
        }
      }
    };

    fetchStories();
  }, []);

  const handleUploadClick = () => {
    setIsUploading(true);
  };

  const handleCloseUpload = () => {
    setIsUploading(false);
  };

  return (
    <div className="story-view-container">
      <div className="story-header">
        <h2>Your Stories</h2>
        <button className="add-story-button" onClick={handleUploadClick}>
          <i className="camera-icon">+</i> Add Story
        </button>
      </div>

      <div className="story-list">
        {stories.length > 0 ? (
          stories.map((story) => (
            <div key={story.id} className="story-item">
              console.log('Media URL:', story.type === 'IMAGE' ? story.imageUrl
              : story.videoUrl);
              {story.type === "IMAGE" ? (
                <img src={story.imageUrl} alt="Story" />
              ) : (
                <video src={story.videoUrl} controls />
              )}
            </div>
          ))
        ) : (
          <p>No stories available.</p>
        )}
      </div>

      {isUploading && (
        <div className="story-upload-modal">
          <Stories onClose={handleCloseUpload} />
        </div>
      )}
    </div>
  );
};

export default StoryView;
