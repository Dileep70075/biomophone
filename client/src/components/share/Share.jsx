import "./share.scss";
import React from "react";
import Image from "../../assets/img.png";
import Map from "../../assets/map.png";
import Friend from "../../assets/friend.png";
import { useContext, useState } from "react";
import { UserProfileContext } from "../../context/UserProfileContext";

async function createPost(data, file) {
  const formData = new FormData();
  
  formData.append("userId", data.userId);
  formData.append("content", data.content);
  if (file) {
    formData.append("img", file);
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/posts/createPostPrisma/`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Error creating post");
    }

    const responseData = await response.json();
    console.warn("Post created successfully:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

const Share = () => {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { userProfile } = useContext(UserProfileContext);

  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createPost(
        {
          userId: parseInt(userProfile.userId), // Get userId from context
          content: desc,
        },
        file
      );
      setDesc("");
      setFile(null);
    } catch (err) {
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <div className="left">
            <img
              src={
                userProfile.profilePicture
                  ? userProfile.profilePicture
                  : "/default-avatar.png"
              }
              alt="Profile"
              className="profile-pic"
            />
            <input
              type="text"
              placeholder={`What's on your mind ${userProfile.name}?`}
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
              className="desc-input"
            />
          </div>
          <div className="right">
            {file && (
              <img
                className="file"
                alt="file-preview"
                src={URL.createObjectURL(file)}
              />
            )}
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file">
              <div className="item">
                <img src={Image} alt="Add Image" />
                <span>Add Image</span>
              </div>
            </label>
            <div className="item">
              <img src={Map} alt="Add Place" />
              <span>Add Place</span>
            </div>
            <div className="item">
              <img src={Friend} alt="Tag Friends" />
              <span>Tag Friends</span>
            </div>
          </div>
          <div className="right">
            <button onClick={handleClick} disabled={loading}>
              {loading ? "Posting..." : "Share"}
            </button>
            {error && <div className="error">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
