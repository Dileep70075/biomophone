import React, { useState } from 'react';
import './Profile.scss';

const Profile = ({ user }) => {
  const [bio, setBio] = useState(user.bio);
  const [privacy, setPrivacy] = useState(user.privacySettings);

  const handleUpdate = async () => {
    const res = await fetch('/api/updateProfile', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, bio, privacy }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (res.ok) {
      alert('Profile updated!');
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="profile">
      <h2>{user.name}</h2>
      <img src={user.img || '/default-avatar.png'} alt="Profile" />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Write something about yourself..."
      />
      <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
        <option value="PUBLIC">Public</option>
        <option value="FRIENDS_ONLY">Friends Only</option>
        <option value="PRIVATE">Private</option>
      </select>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default Profile;
