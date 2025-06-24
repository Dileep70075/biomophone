import React, { useState } from "react";
import axios from "axios";
import "./stories.scss";

const Stories = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState(""); // 'image' or 'video'
  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user"));
  const { token, user } = userData;
  const { id: userId } = user;
  console.log("token:", token);
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.type.startsWith("video") ? "video" : "image";
    setType(fileType);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !description) {
      alert("Please select a file and add a description.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("content", description);
      formData.append("type", type.toUpperCase()); // IMAGE or VIDEO
      formData.append("userId", userId); // Replace with actual user ID
      formData.append(
        "expiresAt",
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      );

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/stories/create`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.warn("Story uploaded:", response.data);
      onClose();
    } catch (error) {
      console.error("Error uploading story:", error);
      alert("Error uploading story.");
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = () => {
    const draft = {
      content: description,
      file: selectedFile,
      type,
    };
    localStorage.setItem("storyDraft", JSON.stringify(draft));
    console.log("Draft saved.");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Upload Story</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          className="description-input"
        />
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="file-input"
        />
        <div className="action-buttons">
          <button onClick={saveDraft} className="action-button">
            Save Draft
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="action-button"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stories;
