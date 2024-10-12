import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faUser, faSignOutAlt, faBars, faClipboardList, faFileAlt, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

function Sidebar({ user, setUser }) {
  const [isOpen, setIsOpen] = useState(true); // Sidebar standardmäßig ausgeklappt
  const [hasAccess, setHasAccess] = useState(false); // Zustand für die Berechtigung standardmäßig auf false
  const [hasAccessRecords, setHasAccessRecords] = useState(false); // Zustand für die Berechtigung für Strafakten
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('http://localhost:3001/check-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setHasAccess(data.hasAccess);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false); // Setze hasAccess auf false bei Fehler
      }
    };

    const checkAccessRecords = async () => {
      try {
        const response = await fetch('http://localhost:3001/check-access-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setHasAccessRecords(data.hasAccess);
      } catch (error) {
        console.error('Error checking access records:', error);
        setHasAccessRecords(false); // Setze hasAccessRecords auf false bei Fehler
      }
    };

    if (user) {
      checkAccess();
      checkAccessRecords();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');

    fetch('http://localhost:3001/logout', { method: 'POST', credentials: 'include' })
      .then(() => {
        setUser(null);
        navigate('/');
      })
      .catch(error => {
        console.error('Logout Error:', error);
      });
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <FontAwesomeIcon icon={faBars} onClick={toggleSidebar} className="menu-icon" />
      </div>
      {user && (
        <div className={`user-info ${isOpen ? 'show' : ''}`}>
          <Link to="/profile">
            <img src={user.avatar} alt={user.displayName} className={`profile-image ${isOpen ? 'big' : 'small'}`} />
          </Link>
          {isOpen && (
            <div className="user-details">
              <h3>{user.displayName}</h3>
              <p>Steam-64-ID: {user.id}</p>
            </div>
          )}
        </div>
      )}
      <ul>
        <li>
          <Link to="/dashboard" className="sidebar-link">
            <FontAwesomeIcon icon={faTachometerAlt} />
            {isOpen && <span>Dashboard</span>}
          </Link>
        </li>
        <li>
          <Link to="/TPD" className="sidebar-link">
            <FontAwesomeIcon icon={faUser} />
            {isOpen && <span>TPD</span>}
          </Link>
        </li>
        {hasAccess === true && (
        <li>
          <Link to="/trainings" className="sidebar-link"> {/* Neuer Link zur TrainingsPage */}
            <FontAwesomeIcon icon={faDumbbell}/> 
            {isOpen && <span>Trainings</span>}
          </Link>
        </li>
        )}
        {hasAccess === true && (
          <li>
            <Link to="/applications" className="sidebar-link">
              <FontAwesomeIcon icon={faClipboardList} /> 
              {isOpen && <span>Bewerbungen</span>}
            </Link>
          </li>
        )}
        {hasAccessRecords === true && (
          <li>
            <Link to="/criminal-records" className="sidebar-link">
              <FontAwesomeIcon icon={faFileAlt} />
              {isOpen && <span>Strafakten</span>}
            </Link>
          </li>
        )}
        {user && (
          <li>
            <button className="sidebar-link" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              {isOpen && <span>Logout</span>}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Sidebar;