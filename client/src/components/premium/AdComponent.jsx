import React from 'react';
import { useUser } from '../../context/UserContext';

const AdComponent = () => {
  const { user } = useUser();

  if (user.isPremium) return null;

  return (
    <div className="ad-component">
      <p>Your Ad Here! Reach thousands of users instantly.</p>
    </div>
  );
};

export default AdComponent;
