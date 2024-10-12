import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ChatPage.css'; // Import the CSS file
import Sidebar from './Sidebar';
import './Sidebar.css'; // Import the CSS file

const ChatPage = () => {
  const { applicationId } = useParams();
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [applicantName, setApplicantName] = useState(''); // Neuer Zustand für den Namen des Bewerbers
  const [user, setUser] = useState(null); // Zustand für den Benutzer
  const [status, setStatus] = useState(''); // Zustand für den Status
  const [newStatus, setNewStatus] = useState(''); // Zustand für den neuen Status
  const [statusMessage, setStatusMessage] = useState(''); // Zustand für die Statusmeldung

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/chat/${applicationId}`, {
          withCredentials: true // Send cookies with the request
        });
        if (response.data.success) {
          setChat(response.data.chat);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
        setIsAuthorized(false);
      }
    };

    const fetchApplicantName = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/application/${applicationId}`, {
          withCredentials: true // Send cookies with the request
        });
        if (response.data.success) {
          setApplicantName(response.data.ingameName);
          setStatus(response.data.application.status); // Setze den Status
        }
      } catch (error) {
        console.error('Error fetching applicant name:', error);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:3001/user', {
          withCredentials: true // Send cookies with the request
        });
        if (response.data.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchChat();
    fetchApplicantName();
    fetchUser();
  }, [applicationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:3001/chat/${applicationId}`, { message }, {
        withCredentials: true // Send cookies with the request
      });
      if (response.data.success) {
        setChat([...chat, { id: Date.now(), message, name: response.data.ingameName }]); // Update chat with the new message
        setMessage(''); // Clear the input field
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStatusChange = (newStatus) => {
    setNewStatus(newStatus); // Setze den neuen Status
  };

  const handleConfirmStatusChange = async () => {
    try {
      const response = await axios.put(`http://localhost:3001/application/${applicationId}/status`, { status: newStatus }, {
        withCredentials: true // Send cookies with the request
      });
      if (response.data.success) {
        setStatus(newStatus); // Update the status
        setNewStatus(''); // Clear the new status
        setStatusMessage('Status erfolgreich geändert'); // Setze die Statusmeldung
        setTimeout(() => setStatusMessage(''), 3000); // Lösche die Statusmeldung nach 3 Sekunden
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="page-container">
      <Sidebar user={user} setUser={setUser} className="sidebar" />
      <div className="chat-page">
        <div className="chat-container">
          <h1 className="chat-header">Bewerbung von {applicantName}</h1>
          <div className="status-container">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={newStatus || status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="status-dropdown"
            >
              <option value="">Bitte Option auswählen</option>
              <option value="0">Abgelehnt</option>
              <option value="1">Angenommen</option>
            </select>
            {newStatus && (
              <button onClick={handleConfirmStatusChange} className="confirm-status-button">
                Status bestätigen
              </button>
            )}
          </div>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
          {isAuthorized ? (
            <>
              <div className="chat-box">
                <ul className="chat-messages">
                  {chat.map((msg) => (
                    <li key={msg.id} className="chat-message">
                      <strong>{msg.name}:</strong> {msg.message}
                    </li>
                  ))}
                </ul>
              </div>
              <form className="chat-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message"
                  className="chat-input"
                />
                <button type="submit" className="chat-send-button">Send</button>
              </form>
            </>
          ) : (
            <p className="unauthorized-message">Sie sind nicht berechtigt, diesen Chat zu sehen.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;