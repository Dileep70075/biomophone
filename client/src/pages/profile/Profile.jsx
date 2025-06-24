import React, { useContext, useState, useEffect } from "react";
import { UserProfileContext } from "../../context/UserProfileContext";
import "./profile.scss";

const Profile = () => {
  const { userProfile, updateUserProfile } = useContext(UserProfileContext);
  const { username, email, name, profilePicture, bio, privacy, interests = [] } = userProfile; // Default to an empty array
const [saveData, setSaveData] = useState([])
const [selectedImage, setSelectedImage] = useState([])

useEffect(() => {
  // console.log("interests in Profile:", saveData);
  //   console.log("interests i:", userProfile);
}, [saveData]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = userData?.token;
        const response = await fetch(`${API_URL}/api/profiles/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setSaveData(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);
  const [newInterest, setNewInterest] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    username,
    email,
    name,
    bio,
    interests,
  });
  const API_URL = import.meta.env.VITE_APP_MY_API_URL;
  const IMAGE_URL = import.meta.env.VITE_MINIO_ENDPOINT;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);

      const formData = new FormData();
      formData.append('img', file);
      try {
        const response = await fetch(`${API_URL}/api/profiles/profile/${userProfile.userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${userProfile.token}` 
          },
          body: formData
        });
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        const data = await response.json();
        // Update profile picture and other details from the response
        updateUserProfile("profilePicture", data.img);
        updateUserProfile("name", data.name);
        updateUserProfile("bio", data.bio);
        updateUserProfile("email", data.email);
        updateUserProfile("username", data.username);
        updateUserProfile("interests", data.interests ? JSON.parse(data.interests) : []);
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("user")) || { user: {} };
        userData.user.profilePic = data.img;
        userData.user.name = data.name;
        userData.user.bio = data.bio;
        userData.user.email = data.email;
        userData.user.username = data.username;
        userData.user.interests = data.interests ? JSON.parse(data.interests) : [];
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading the image.");
      }
    }
  };

  const handleAddInterest = () => {
    if (newInterest) {
      const updatedInterests = [...interests, newInterest];
      updateUserProfile("interests", updatedInterests);
      // Save interests to localStorage
      const userData = JSON.parse(localStorage.getItem("user")) || { user: {} };
      userData.user.interests = updatedInterests;
      localStorage.setItem("user", JSON.stringify(userData));
      setEditedProfile(prev => ({
        ...prev,
        interests: updatedInterests
      }));
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (index) => {
    const updatedInterests = interests.filter((_, i) => i !== index);
    updateUserProfile("interests", updatedInterests);
    // Save updated interests to localStorage
    const userData = JSON.parse(localStorage.getItem("user")) || { user: {} };
    userData.user.interests = updatedInterests;
    localStorage.setItem("user", JSON.stringify(userData));
  };
  const handleEditToggle = () => {
    setEditedProfile({
      username,
      email,
      name,
      bio,
      interests: Array.isArray(interests) ? interests.join(", ") : (interests || "")
    });
    setIsEditing(!isEditing);
  };
  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profiles/profile/${userProfile.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userProfile.token}`
        },
        body: JSON.stringify({
          name: editedProfile.name,
          bio: editedProfile.bio,
          interests: editedProfile.interests,
          privacySettings: privacy
        })
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      const updatedProfile = await response.json();
      // Update all relevant fields from the response
      Object.keys(updatedProfile).forEach((key) => {
        if (key === "interests") {
          updateUserProfile(key, updatedProfile[key] ? JSON.parse(updatedProfile[key]) : []);
        } else {
          updateUserProfile(key, updatedProfile[key]);
        }
      });
      // Update localStorage
      const userData = JSON.parse(localStorage.getItem("user")) || { user: {} };
      userData.user = { ...userData.user, ...updatedProfile };
      if (updatedProfile.interests) {
        userData.user.interests = JSON.parse(updatedProfile.interests);
      }
      localStorage.setItem("user", JSON.stringify(userData));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  };
  return (
    <div className="profile">
      <div className="user_name_edit_container">
        <h2>{username || "Your Profile"}</h2>
        <button onClick={handleEditToggle}>Edit Profile</button>
      </div>
     
      <div className="profile-picture-section">
          <img src={profilePicture ? `${IMAGE_URL}${profilePicture}` : (saveData?.img ? `${IMAGE_URL}${saveData.img}` : "image")}
  alt="Profile"
  className="profile-picture"
/>
        {isEditing && (
          <input type="file" accept="image/*" onChange={handleFileUpload} />
        )}
      </div>
      {isEditing ? (
        <>
          <div className="edit-fields">
            <label>
              Username:
              <input
                type="text"
                value={editedProfile.username}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    username: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={editedProfile.email}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, email: e.target.value })
                }
              />
            </label>
            <label>
              Name:
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, name: e.target.value })
                }
              />
            </label>
            <label>
              Bio:
              <textarea
                value={editedProfile.bio}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, bio: e.target.value })
                }
              />
            </label>
            {/* <label>
              Interests:
              <input
                type="text"
                value={editedProfile.interests}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, interests: e.target.value })
                }
              />
            </label> */}
          </div>
          <div className="interests">
            <input
              type="text"
              placeholder="Add interests"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
            />
            <button onClick={handleAddInterest}>Add</button>
          </div>
          <select
            value={privacy}
            onChange={(e) => updateUserProfile("privacy", e.target.value)}
          >
            <option value="PUBLIC">Public</option>
            <option value="FRIENDS_ONLY">Friends Only</option>
            <option value="PRIVATE">Private</option>
          </select>
          <button onClick={handleSaveProfile}>Save Changes</button>
          {/* <div className="profile-details"> */}
            {/* <strong>Interests:</strong>{}
            {
              Array.isArray(interests) && interests.filter(item => item && item.trim() !== '' && item.trim() !== ',').length > 0
                ? interests.filter(item => item && item.trim() !== '' && item.trim() !== ',').join(", ")
                : "No interests added yet."
            } */}
          {/* </div> */}
        </>
      ) : (
        <>
          <div className="profile-details">
            <p>
              <strong>Username:</strong> {username}
            </p>
            <p>
              <strong>Email:</strong> {email}
            </p>
            <p>
              <strong>Name:</strong> {name}
            </p>
            <p>
              <strong>Bio:</strong> {bio || "No bio added yet."}
            </p>
            {/* <strong>Interests:</strong>{" "}
            {
              Array.isArray(interests) && interests.filter(item => item && item.trim() !== '' && item.trim() !== ',').length > 0
                ? interests.filter(item => item && item.trim() !== '' && item.trim() !== ',').join(", ")
                : "No interests added yet."
            } */}
            
<strong>Interests:</strong>{" "}
{
  (() => {
    let displayInterests = interests;
    if (typeof displayInterests === "string") {
      try {
        displayInterests = JSON.parse(displayInterests);
      } catch (e) {
        displayInterests = displayInterests.split(",");
      }
    }
    // Filter: keep only words with at least 2 letters, ignore fragments and symbols
    const filtered = Array.isArray(displayInterests)
      ? displayInterests
          .map(item => typeof item === "string" ? item.trim() : "")
          .filter(item =>
            item.length > 1 &&
            /^[a-zA-Z\s]+$/.test(item)
          )
      : [];
    return filtered.length > 0
      ? filtered.join(", ")
      : "No interests added yet.";
  })()
}

          </div>
        </>
      )}
    </div>
  );
};

export default Profile;

