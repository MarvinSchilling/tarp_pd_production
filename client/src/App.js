import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Apply from "./components/Apply";
import TPD from "./components/TPD";
import Profile from "./components/Profile"; // Richtig, da sich die Datei im src-Ordner befindet
import Training from './components/Training'; // Ensure the import matches the file name
import ApplicationsPage from './components/ApplicationPage'; // Importiere die neue Seite
import ChatPage from './components/ChatPage'; // Importiere die Chat-Seite
import CriminalRecordsPage from './components/CriminalRecordsPage'; // Importiere die Seite für Strafakten

function App() {
  const [user, setUser] = useState(null); // Zustand für den Benutzer

  useEffect(() => {
    // Benutzerinformationen abrufen
    fetch('http://localhost:3001/user', { credentials: 'include' })
      .then(response => response.json())
      .then(data => setUser(data.user))
      .catch(error => console.error('Error fetching user info:', error));
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/login" element={<Login />} />
            <Route path="/TPD" element={user ? <TPD user={user} setUser={setUser} /> : <Navigate to="/" />} /> {/* Route zur TPD-Seite */}
            <Route path="/mitarbeiter" element={user ? <TPD user={user} setUser={setUser} /> : <Navigate to="/" />} /> {/* Route zum Mitarbeiter-Hinzufügen */}
            <Route path="/trainings" element={user ? <Training user={user} setUser={setUser} /> : <Navigate to="/" />} /> {/* Add this route */}
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
            <Route path="/applications" element={<ApplicationsPage user={user} setUser={setUser} />} />
            <Route path="/chat/:applicationId" element={<ChatPage />} />
            <Route path="/criminal-records" element={user ? <CriminalRecordsPage /> : <Navigate to="/" />} /> {/* Route zur Seite für Strafakten */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;