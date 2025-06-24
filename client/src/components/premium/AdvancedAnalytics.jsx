import React from 'react';
import { useUser } from '../../context/UserContext';

const AdvancedAnalytics = () => {
  const { user } = useUser();

  if (!user.isPremium) {
    return (
      <div className="analytics-locked">
        <h2>Advanced Analytics</h2>
        <p>This feature is available only for Premium Members.</p>
      </div>
    );
  }

  return (
    <div className="analytics-section">
      <h2>Advanced Analytics</h2>
      <p>Get detailed insights about your content and audience engagement.</p>
    </div>
  );
};

export default AdvancedAnalytics;
