import { useState } from "react";
import React from "react";
import axios from "axios";
import "./EventCreationForm.scss";

const EventCreationForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [groupId, setGroupId] = useState("");
  const [creatorId, setCreatorId] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !date || !groupId) {
      setError("All fields are required!");
      setSuccess("");
      return;
    }

    const eventData = {
      name,
      description,
      date,
      groupId: parseInt(groupId),
      creatorId,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events/create`,
        eventData
      );
      console.warn("Event created:", response.data);
      setSuccess("Event created successfully!");
      setError("");
    } catch (error) {
      console.error("Error creating event:", error);
      setError("There was an error creating the event. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="event-creation-form">
      <h2>Create New Event</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Event Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Event Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Group ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />

        <button type="submit">Create Event</button>
      </form>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </div>
  );
};

export default EventCreationForm;
