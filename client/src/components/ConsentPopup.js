// ConsentPopup.js
import React from 'react';
import './ConsentPopup.css'; // Hier kannst du deine Styles anpassen

const ConsentPopup = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>Bestätigung</h2>
        <p>{message}</p>
        <div className="popup-buttons">
          <button onClick={onConfirm}>Ja, löschen</button>
          <button onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
};

export default ConsentPopup;