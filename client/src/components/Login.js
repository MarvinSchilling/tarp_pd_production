import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '../App.css';
import Stars from './Stars'; // Importiere die Stars-Komponente

const Login = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // useNavigate Hook

  const steamLoginUrl = 'http://localhost:3001/auth/steam'; // Steam Login URL (Backend)

  useEffect(() => {
    // Überprüfen, ob der Benutzer eingeloggt ist
    fetch('http://localhost:3001/user', { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        setUser(data.user); // Benutzerinformationen setzen
        if (data.user) {
          navigate('/dashboard'); // Weiterleitung zum Dashboard
        }
      })
      .catch(error => console.error('Error fetching user info:', error)); // Fehlerprotokollierung
  }, [navigate]); // Dependency Array anpassen

  return (
    <div className="App">
      {/* Sternenhimmel im Hintergrund */}
      <Stars />

      {/* Container mit Login-Option */}
      <div className="container-wrapper">
        {/* Disclaimer-Box */}
        <div className="disclaimer-box">
          <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px', color: 'white' }} />
          <span>
            Diese Website ist ein fiktives Konstrukt für eine Behörde, die in einem Online-Rollenspiel existiert.<br />
            Alle Daten auf dieser Website stehen in keinem Bezug zu einer staatlichen Behörde.
          </span>
        </div>

        <div className="container">
          <h1>Tanoa Police Department</h1>
          {user ? (
            <p>Willkommen, {user.displayName}!</p>
          ) : (
            <>
              <p>Du musst dich über Steam anmelden, um das Intranet nutzen zu können.</p>
              <a href={steamLoginUrl}>
                <img
                  src="https://community.akamai.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
                  alt="Mit Steam anmelden"
                />
              </a>
            </>
          )}

          {/* Footer mit Links */}
          <div className="footer-links">
            <a href="https://discord.gg/v5GZFMSEEQ" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faDiscord} style={{ width: '30px', height: '30px', marginRight: '10px', color: 'white' }} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faGlobe} style={{ width: '30px', height: '30px', color: 'white' }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
