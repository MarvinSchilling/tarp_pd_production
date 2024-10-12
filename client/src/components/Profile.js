import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "./Sidebar";
import './Profile.css'; // Importiere die CSS-Datei
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faStar, faGun, faUserSecret, faChalkboardTeacher, faUser } from '@fortawesome/free-solid-svg-icons';

function Profile({ user, setUser }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState(''); // State für den Rang
  const [trainings, setTrainings] = useState([]); // State für die Ausbildungen
  const navigate = useNavigate(); // useNavigate Hook für Navigation

  const [userFunction, setUserFunction] = useState(''); // State für die Funktion

  const [activeStatus, setActiveStatus] = useState(null); // Status hinzufügen

  function getRankIcon(rang) {
    switch (rang) {
      case '13 - Chief of Police':
        return 'http://localhost:3001/images/chief2.png';
      case '12 - Assistant Chief':
        return 'http://localhost:3001/images/assiChief2.png';
      case '11 - Academy Director':
        return 'http://localhost:3001/images/divisionLead2.png';
      case '11 - SWAT Commander':
        return 'http://localhost:3001/images/divisionLead2.png';
      case '11 - FBI Director':
        return 'http://localhost:3001/images/divisionLead2.png';
      case '10 - Assistant Academy Director':
        return 'http://localhost:3001/images/assistantDivisionLead2.png';
      case '10 - Assistant SWAT Commander':
        return 'http://localhost:3001/images/assistantDivisionLead2.png';
      case '10 - Assistant FBI Director':
        return 'http://localhost:3001/images/assistantDivisionLead2.png';
      case '09 - Inspector':
        return 'http://localhost:3001/images/inspector2.png';
      case '08 - Captain':
        return 'http://localhost:3001/images/captain2.png';
      case '07 - Lieutenant':
        return 'http://localhost:3001/images/lieutenant2.png';
      case '06 - Staff Sergeant':
        return 'http://localhost:3001/images/staffSergeant2.png';
      case '05 - Sergeant':
        return 'http://localhost:3001/images/sergeant2.png';
      case '04 - Corporal':
        return 'http://localhost:3001/images/corporal2.png';
      case '03 - Officer II':
        return 'http://localhost:3001/images/officer22.png';
      case '02 - Officer':
        return 'http://localhost:3001/images/officer2.png';
      case '01 - Cadet':
        return 'http://localhost:3001/images/cadet.png';
      default:
        return null;  // Kein Icon, wenn der Rang nicht erkannt wird
    }
  }
  
  function getFunctionBadge(funktion) {
    switch (funktion) {
      case 'Administrative Leitung':
        return { 
          color: '#d45d55', 
          text: 'Administrative Leitung', 
          icon: faCrown 
        }; // Hellrot
      case 'Abteilungsleitung':
        return { 
          color: '#c26400', 
          
          text: 'Abteilungsleitung', 
          icon: faStar 
        }; // Gelb
      case 'SWAT':
        return { 
          color: '#3f4142', 
          text: 'SWAT', 
          icon: faGun 
        }; // Schwarz
      case 'FBI':
        return { 
          color: '#001F5B', 
          text: 'FBI', 
          icon: faUserSecret 
        }; // Dunkelblau
      case 'Ausbilder':
        return { 
          color: '#28a745', 
          text: 'Instructor', 
          icon: faChalkboardTeacher 
        }; // Grün
      case 'Officer':
        return { 
          color: '#1f74bf', 
          text: 'Officer', 
          icon: faUser 
        }; // Hellblau
      default:
        return { 
          color: '#CCCCCC', 
          text: 'Unbekannt', 
          icon: null 
        }; // Grau für unbekannte Funktionen
    }
  }


  // Constant trainingData bis DATABASE Steht @Koslowsky
  const trainingData = [
    { abbreviation: 'GA', fullName: 'Grundausbildung' },
    { abbreviation: 'LST', fullName: 'Leitstellentheorie' },
    { abbreviation: 'LSP', fullName: 'Leitstellenpraxis' },
    { abbreviation: 'FA', fullName: 'Fahrausbildung' },
    { abbreviation: 'GWS', fullName: 'Großer Waffenschein' },
    { abbreviation: 'TAK', fullName: 'Taktikausbildung' },
    { abbreviation: 'VPT', fullName: 'Verhandlungspartnertheorie' },
    { abbreviation: 'PR', fullName: 'Prison Ausbildung' },
    { abbreviation: 'FIE', fullName: 'Führen im Einsatz' },
    { abbreviation: 'SF', fullName: 'Sonderfalltraining' },
    { abbreviation: 'AU', fullName: 'Air Unit' },
    { abbreviation: 'VPS', fullName: 'Verhandlungspartnerschein' },
    { abbreviation: 'ELS', fullName: 'Einsatzleiterschein' },
    { abbreviation: 'SUP', fullName: 'Supervisorprüfung' },
  ];

  useEffect(() => {
    const fetchUserRank = async () => {
      try {
        const response = await fetch('http://localhost:3001/mitarbeiter/rank', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }), // Verwende userId statt steamId
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Fehlerantwort vom Server:', errorText);
          throw new Error('Fehler beim Abrufen des Rangs.');
        }
  
        const data = await response.json();
        console.log("Rank data:", data);  // Prüfe die erhaltenen Daten
        
        setRank(data.rank);  // Setze den Rang im State
        setUserFunction(data.funktion);  // Setze die Funktion im State
        setActiveStatus(data.aktiv);
      } catch (error) {
        console.error('Fehler:', error.message);
      }
    };
  
    fetchUserRank();
  }, [user.id]);
  
  

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('http://localhost:3001/apply/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!response.ok) {
          throw new Error('Fehler beim Abrufen der Bewerbungen.');
        }

        const { exists } = await response.json();

        if (exists) {
          const applicationsResponse = await fetch('http://localhost:3001/apply?userId=' + user.id);
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error('Fehler:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user.id]);

  // Fetch für Trainingsdaten
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const response = await fetch('http://localhost:3001/trainings'); // Trainingsdaten abrufen
        
        if (!response.ok) {
          throw new Error('Fehler beim Abrufen der Trainings.');
        }

        const trainingsData = await response.json();
        setTrainings(trainingsData);
      } catch (error) {
        console.error('Fehler:', error);
      }
    };

    fetchTrainings();
  }, []); // Dieser Effekt läuft einmal beim Mounten der Komponente

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    // Hier die Logik für das Speichern des neuen Status hinzufügen
    // Zum Beispiel eine API-Anfrage, um den Status in der DB zu aktualisieren

    setTrainings((prevTrainings) =>
      prevTrainings.map((training) =>
        training.id === name ? { ...training, completed: checked } : training
      )
    );
  };

  const handleRowClick = (applicationId) => {
    navigate(`/chat/${applicationId}`);
  };

  if (loading) {
    return <div>Lädt...</div>;
  }
  
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} setUser={setUser} />
      <div style={{ marginLeft: '20px', flex: 1 }}>
        <h1>Profilseite</h1>
        <h2>{user.displayName}'s Bewerbungen</h2>
        <div className="table-container">
          <table className="table-idk">
            <thead className="table-header">
              <tr>
                <th>Fraktion</th>
                <th>Ingame Name</th>
                <th>Discord Name</th>
                <th>Status</th>
                <th>Bewerbungstext</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {applications.length > 0 ? (
                applications.map((router) => (
                  <tr key={router.id} onClick={() => handleRowClick(router.id)}>
                    <td>{router.faction}</td>
                    <td>{router.ingameName}</td>
                    <td>{router.discordName}</td>
                    <td className="status badge"
                        style={{
                          backgroundColor: router.status === null
                              ? 'orange'
                              : router.status === 0
                                  ? 'red'
                                  : router.status === 1
                                      ? 'green'
                                      : 'gray',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontWeight: 'bold'
                        }}
                    >
                      {router.status === null
                          ? "In Bearbeitung"
                          : router.status === 0
                              ? "Abgelehnt"
                              : router.status === 1
                                  ? "Angenommen"
                                  : "Unbekannter Status"}
                    </td>
                    <td>{router.applicationText}</td>
                  </tr>
                ))
              ) : (
                  <tr>
                    <td colSpan="5" className="no-applications">
                      Keine Bewerbungen gefunden.
                    </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
  
        {/* Dashboard Cards Section */}
        <div className="dashboard-cards-container">
          <div className="dashboard-card">
            <h2>Ausbildungen</h2>
            <div className="training-table">
              <table className="table-idk">
                <thead className="table-header">
                  <tr>
                    <th>Kürzel</th>
                    <th>Bezeichnung</th>
                    <th>Absolviert</th>
                  </tr>
                </thead>
                <tbody>
                  {trainings.length > 0 ? (
                    trainings.map((training) => (
                      <tr key={training.id}>
                        <td>{training.abbreviation}</td> {/* Angenommene Felder */}
                        <td>{training.name}</td>
                        <td>
                          <input 
                            type="checkbox" 
                            name={training.id} 
                            checked={training.completed} // Checkbox basierend auf dem Status setzen
                            onChange={handleCheckboxChange} 
                          />
                        </td> {/* Checkbox für Abgehakt */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-applications">
                        Keine Ausbildungen gefunden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="dashboard-card">
            <h2>Informationen</h2>
            <div className="info-section">
              {/* Rangicon */}
              <div className="rank-icon">
                {getRankIcon(rank) && (
                  <img
                    src={getRankIcon(rank)}
                    alt={rank}
                    style={{ width: '30px', height: '30px' }} 
                  />
                )}
              </div>
  
              {/* Rangbezeichnung */}
              <p className="rank-name">
                Aktueller Rang: <strong>{rank}</strong>
              </p>
  
              {/* Funktions-Badge */}
              <div className="badge user-function" 
     style={{ 
       backgroundColor: getFunctionBadge(userFunction).color, 
       padding: '5px 10px', 
       borderRadius: '6px', 
       display: 'inline-block', 
       marginTop: '10px',
       color: '#fff'
     }}>
  {getFunctionBadge(userFunction).icon ? (
    <FontAwesomeIcon 
      icon={getFunctionBadge(userFunction).icon} 
      style={{ marginRight: '8px', color: '#fff' }} 
    />
  ) : null}
  {getFunctionBadge(userFunction).text}
</div>
 {/* Aktivitätsstatus Badge */}
 <div className="badge activity-status" 
             style={{ 
               backgroundColor: activeStatus ? 'green' : 'red', 
               color: 'white', 
               padding: '5px 10px', 
               borderRadius: '6px', 
               display: 'inline-block', 
               marginTop: '10px' 
             }}>
          {activeStatus ? 'Aktiv' : 'Inaktiv'}
        </div>
            </div>
          </div>
          <div className="dashboard-card">
            <h2>Ranghistorie</h2>
            <div className="placeholder-chart">Chart Placeholder</div>
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default Profile;