import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CriminalRecordsPage.css';
import Sidebar from './Sidebar';

const CriminalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [accusedName, setAccusedName] = useState(''); // Name des Beschuldigten
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({}); // Benutzerzustand
  const [hasAccess, setHasAccess] = useState(false); // Zustand für den Zugriff

  useEffect(() => {
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

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAccess = async () => {
      if (!user.id) return; // Warten, bis die userId verfügbar ist

      try {
        const response = await fetch('http://localhost:3001/check-access-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }), // Benutzer-ID senden
        });

        if (!response.ok) {
          throw new Error('Fehler beim Überprüfen des Zugriffs.');
        }

        const data = await response.json();
        setHasAccess(data.hasAccess); // Setze den Zugriff
      } catch (error) {
        console.error('Fehler:', error);
      } finally {
        setLoading(false); // Ladezustand beenden
      }
    };

    fetchAccess();
  }, [user.id]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('http://localhost:3001/criminal-records');
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    fetchRecords();
  }, []);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/criminal-records', {
        userId: user.id, // Benutzer-ID aus dem aktuellen Benutzerzustand
        accusedName,
        description,
        date,
      });
      setMessage(response.data.message);
      setAccusedName('');
      setDescription('');
      setDate('');
      // Aktualisieren Sie die Liste der Strafakten
      const updatedRecords = await axios.get('http://localhost:3001/criminal-records');
      setRecords(updatedRecords.data);
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return <div>Zugriff verweigert</div>;
  }

  return (
    <div className="page-container">
      <Sidebar user={user} setUser={setUser} className="sidebar" />
      <div className="criminal-records-page">
        <div className="form-container">
          <h1 className="form-header">Verwaltung von Strafakten</h1>
          <form onSubmit={handleAddRecord} className="add-record-form">
            <div>
              <label htmlFor="accusedName">Name des Beschuldigten:</label>
              <input
                type="text"
                id="accusedName"
                value={accusedName}
                onChange={(e) => setAccusedName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="description">Beschreibung:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="date">Datum:</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="add-record-button">Strafakte hinzufügen</button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
        <div className="records-container">
          <h2 className="records-header">Bestehende Strafakten</h2>
          <table className="records-table">
            <thead>
              <tr>
                <th>Name des Beschuldigten</th>
                <th>Beschreibung</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.accusedName}</td>
                  <td>{record.description}</td>
                  <td>{record.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CriminalRecordsPage;