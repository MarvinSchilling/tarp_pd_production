import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faQuestionCircle, faEnvelope, faNewspaper, faLockOpen, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import Sidebar from './Sidebar';
import ChipLabel from './ChipLabel';

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'; // Importiere Recharts


function Dashboard() {
  const [user, setUser] = useState(null);
  const [isPopupVisible, setPopupVisible] = useState(false);
/*PIECHART*/
  const [activeIndex, setActiveIndex] = useState(null); // Für den aktiven Index
  const [employeeData, setEmployeeData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const COLORS = ['#d45d55', '#c26400', '#001F5B', '#28a745', '#1f74bf', '#3f4142']; // Hier kannst du die Farben anpassen



  useEffect(() => {
    fetch('http://localhost:3001/user', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      });
      // Fetch employee data
    fetch('http://localhost:3001/mitarbeiter')
    .then((res) => res.json())
    .then((data) => {
      setEmployeeData(data);
      processEmployeeData(data); // Daten verarbeiten
    });
  }, []);

  const processEmployeeData = (data) => {
    const functionCount = {};
  
    data.forEach(employee => {
      const role = employee.funktion; // Die Funktion des Mitarbeiters verwenden
      if (functionCount[role]) {
        functionCount[role] += 1; // Zähle die Anzahl der Mitarbeiter in dieser Funktion
      } else {
        functionCount[role] = 1; // Initialisiere den Zähler für diese Funktion
      }
    });
  
    // Konvertiere das Zählobjekt in ein Array für den PieChart
    const pieData = Object.entries(functionCount).map(([key, value]) => ({
      name: key,
      value: value,
    }));
  
    console.log('PieChart-Daten:', pieData); // Debugging
    setPieChartData(pieData); // Setze die PieChart-Daten
  };

  if (!user) {
    return <h2>Loading...</h2>;
  }

  

  return (

    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar user={user} setUser={setUser} />
      <ChipLabel text="Made by Denver, Koslowsky and Peter" />
      {/* Main Content */}
      <div className={`main-content ${isPopupVisible ? 'blur-content' : ''}`}>
        <div className="application-header">
          <h2>Bewerbung für das TPD</h2>
          <div className="application-options">
            <select className="phase-select">
              <option value="open">Aktuelle Bewerbungsphasen</option>
            </select>
            <div className="class-info">
              <FontAwesomeIcon icon={faLockOpen} className="class-lock-icon" />
              Officer
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className="class-help-icon"
                onClick={() => setPopupVisible(true)} // Öffnet das Popup
              />
            </div>
            <button className="apply-button" onClick={() => window.location.href = '/apply'}>
              <FontAwesomeIcon icon={faEnvelope} /> Bewerben
            </button>
          </div>
        </div>

        <div className="dashboard-row">
          <div className="dashboard-card">
            <h2>Polizisten</h2>
            <div className="piechart-container">
          <PieChart width={300} height={300}>
            <Pie
              data={pieChartData}
              cx={150}
              cy={150}
              innerRadius={50}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={0}
              dataKey="value"
              animationDuration={500}
              onMouseEnter={(data, index) => setActiveIndex(index)} // Setze den aktiven Index beim Hover
              onMouseLeave={() => setActiveIndex(null)} // Setze den aktiven Index zurück beim Verlassen
            >
              {pieChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{ cursor: 'pointer' }} // Zeigt Handcursor beim Hover
                  scale={activeIndex === index ? 1.1 : 1} // Erhöht die Größe beim Hover
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '5px', color: '#000' }}>
                      <strong>{payload[0].name}</strong>: {payload[0].value} Beamte
                    </div>
                  );
                }
                return null;
              }} 
              cursor={false} // Verhindert den Standard-Cursor
            />
          </PieChart>
        </div>
        
        <div className="legend">
          {pieChartData.map((entry, index) => (
            <div key={`legend-${index}`} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <span className="legend-text">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
          <div className="dashboard-card">
            <h2>Spielerzahlen</h2>
            <div className="placeholder-chart">Chart Placeholder</div>
          </div>
          <div className="dashboard-card">
            <h2>TPD Officer</h2>
            <div className="placeholder-info">Info Placeholder</div>
          </div>
        </div>

        <div className="dashboard-news">
          <h2>
            <FontAwesomeIcon icon={faNewspaper} /> Neuigkeiten
          </h2>
          <p>Derzeit gibt es keine Neuigkeiten</p>
        </div>
      </div>

      {/* Pop-up Modal */}
      {isPopupVisible && (
        <>
          <div className="popup-overlay" onClick={() => setPopupVisible(false)}></div> {/* Schließt das Popup, wenn man außerhalb klickt */}
          <div className="popup-modal">
            <div className="popup-content">
              <h2><FontAwesomeIcon icon={faCircleInfo} /> Aktuelle Bewerbungsphase</h2>
              
         {/* Flexbox-basierte Auflistung */}
<div className="info-row">
  <span>Status</span>
  <span className="badge active"><FontAwesomeIcon icon={faLockOpen} /> Offen</span>
</div>

<div className="info-row">
  <span>Zeitraum</span>
  <span className="badge">01.11.2024 - 31.01.2025</span>
</div>

{/* Zulässige Bewerbungstypen mit Legende */}
<div className="info-row">
  <span>Zulässige Bewerbungstypen</span>
  <div className="application-types">
    <span className="badge application-type">Versetzungsantrag</span>
    <span className="badge application-type">Officer</span>
    <span className="badge application-type">Praktikum</span>
  </div>
</div>
<br></br>



              <button onClick={() => setPopupVisible(false)}>Schließen</button> {/* Schließen-Button */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
