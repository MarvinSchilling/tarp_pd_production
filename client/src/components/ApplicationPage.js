import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './ApplicationPage.css'; // Importiere die CSS-Datei

function ApplicationPage({ user, setUser }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false); // Zustand für den Zugriff
  const navigate = useNavigate(); // useNavigate Hook für Navigation^^

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const response = await fetch('http://localhost:3001/check-access', {
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
    const fetchApplications = async () => {
      try {
        const response = await fetch('http://localhost:3001/apply', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Fehler beim Abrufen der Bewerbungen.');
        }

        const applicationsData = await response.json();
        setApplications(applicationsData);
      } catch (error) {
        console.error('Fehler:', error);
      }
    };

    if (hasAccess) {
      fetchApplications(); // Nur abrufen, wenn Zugriff gewährt ist
    }
  }, [hasAccess]);

  const handleRowClick = (applicationId) => {
    navigate(`/chat/${applicationId}`);
  };

  if (loading) {
    return <div>Lädt...</div>; // Ladeanzeige
  }

  if (!hasAccess) {
    return <div>Du hast keinen Zugriff auf diese Seite.</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} setUser={setUser} />
      <div style={{marginLeft: '20px', flex: 1}}>
        <h1>Bewerbungen</h1>
        <table className="application-table">
          <thead>
          <tr>
            <th>Fraktion</th>
            <th>Ingame Name</th>
            <th>Discord Name</th>
            <th>Status</th>
            <th>Bewerbungstext</th>
          </tr>
          </thead>
          <tbody>
          {applications.length > 0 ? (
              applications.map((app) => (
                  <tr key={app.id} onClick={() => handleRowClick(app.id)}>
                    <td>{app.faction}</td>
                    <td>{app.ingameName}</td>
                    <td>{app.discordName}</td>
                    <td>{app.status}</td>
                    <td>{app.applicationText}</td>
                  </tr>
              ))
          ) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center'}}>Keine Bewerbungen gefunden.</td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApplicationPage;