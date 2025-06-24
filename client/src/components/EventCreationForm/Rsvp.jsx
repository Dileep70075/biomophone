import { useState } from 'react';
import axios from 'axios';

const RSVP = ({ eventId }) => {
  const [status, setStatus] = useState('');

  const handleRSVP = async (newStatus) => {
    if (status) {
      alert('You have already responded to this event.');
      return;
    }

    setStatus(newStatus);

    try {
      await axios.post('/api/rsvps/create', {
        eventId,
        status: newStatus,
      });
      console.log(`RSVP status for event ${eventId} set to ${newStatus}`);
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  return (
    <div className="rsvp">
      <button onClick={() => handleRSVP('GOING')} disabled={status}>Going</button>
      <button onClick={() => handleRSVP('MAYBE')} disabled={status}>Maybe</button>
      <button onClick={() => handleRSVP('NOT_GOING')} disabled={status}>Not Going</button>
    </div>
  );
};

export default RSVP;
