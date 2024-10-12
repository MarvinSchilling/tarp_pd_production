// Notification.js
import React from 'react';
import './Notification.css'; // Importiere das CSS für die Benachrichtigung

const Notification = ({ message, onClose }) => {
  return (
    <div className="notification">
      <p>{message}</p>
      <button onClick={onClose} className="close-btn">Schließen</button>
    </div>
  );
};

export default Notification;
