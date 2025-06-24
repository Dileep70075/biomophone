import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
import './CommunityForm.scss'; 
import { checkAuthentication } from "../../services/authService/auth-service"; // Import checkAuthentication

const CreateCommunityForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PUBLIC');
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 

  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if the user is authenticated
      if (!checkAuthentication()) {
        setSnackbarMessage('User not authenticated');
        setSnackbarSeverity('error');
        setOpen(true);
        return;
      }

      // Retrieve the token from local storage
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;

      if (!token) {
        setSnackbarMessage('Token is missing. Please provide a valid token.');
        setSnackbarSeverity('error');
        setOpen(true);
        return;
      }

      await axios.post(`${import.meta.env.VITE_APP_MY_API_URL}/api/communities/create`, {
        name,
        description,
        type,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSnackbarMessage('Community created successfully');
      setSnackbarSeverity('success');
      setOpen(true);

      setName('');
      setDescription('');
      setType('PUBLIC');

      setTimeout(() => {
        navigate('/community');
      }, 2000); 
    } catch (error) {
      setSnackbarMessage('Error creating community');
      setSnackbarSeverity('error');
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="create-community-form-container">
      <form onSubmit={handleSubmit} className="create-community-form">
        <h2>Create Community</h2>
        <input
          type="text"
          placeholder="Community Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />
        <textarea
          placeholder="Community Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
        />
        <select
          onChange={(e) => setType(e.target.value)}
          value={type}
          className="input-field"
        >
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
          <option value="HIDDEN">Hidden</option>
        </select>
        <button type="submit" className="submit-btn">Create Community</button>
      </form>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CreateCommunityForm;
