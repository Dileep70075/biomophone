import React from 'react';

const SponsoredPost = ({ content }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', backgroundColor: '#fff8dc' }}>
      <strong>Sponsored Post:</strong>
      <p>{content}</p>
    </div>
  );
};

export default SponsoredPost;
