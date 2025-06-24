import React from 'react';
import { useUser } from '../../context/UserContext';

const PremiumPage = () => {
  const { user, setUser } = useUser();

  const handleUpgrade = async () => {
    try {
      const response = await fetch('http://localhost:8800/api/users/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser({ ...user, ...updatedUser });
        alert('Successfully upgraded to Premium!');
      } else {
        console.error('Upgrade failed');
        alert('Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error('Error during upgrade:', error);
    }
  };

  return (
    <div className="premium-page">
      <h1>Go Premium</h1>
      <p>Enjoy ad-free browsing, advanced analytics, and exclusive features.</p>
      {!user.isPremium ? (
        <button className="upgrade-button" onClick={handleUpgrade}>
          Upgrade to Premium
        </button>
      ) : (
        <p>You are already a Premium Member!</p>
      )}
    </div>
  );
};

export default PremiumPage;
