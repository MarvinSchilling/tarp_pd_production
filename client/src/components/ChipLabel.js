import React from 'react';
import './ChipLabel.css'; // Für CSS Styling

const ChipLabel = ({ text }) => {
  return (
    <div className="chip-container">
      <span className="chip-label">{text}</span>
    </div>
  );
};

export default ChipLabel;
