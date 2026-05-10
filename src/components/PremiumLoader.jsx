import React from 'react';

const PremiumLoader = ({ text = "Loading" }) => {
  return (
    <div className="loader-container">
      <div className="premium-loader">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
      </div>
      <div className="loader-text">{text}</div>
    </div>
  );
};

export default PremiumLoader;
