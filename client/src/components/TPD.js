import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar"; // Importiere die Sidebar
import ConsentPopup from './ConsentPopup'; // Importiere die ConsentPopup-Komponente
import "./TPD.css"; // CSS für die TPD-Seite
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faCrown, faStar, faGun, faUserSecret, faChalkboardTeacher, faUser, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

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


function TPD({ user, setUser }) {
  const [mitarbeiter, setMitarbeiter] = useState([]);
  const [acceptedApplicants, setAcceptedApplicants] = useState([]);
  const [neuerMitarbeiter, setNeuerMitarbeiter] = useState({
    rang: "",
    name: "",
    dienstnummer: "",
    funktion: "",
    aktiv: true, // Standardmäßig aktiv
  });
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [showAddButton, setShowAddButton] = useState(false); // Start ist wahr
  const [showEditButton, setShowEditButton] = useState(false); // Start ist wahr
  const [showDeleteButton, setShowDeleteButton] = useState(false); // NEU: Für den Lösch-Button
  const [message, setMessage] = useState(null);  // For success or error messages
  const [messageType, setMessageType] = useState(null);  // "success" or "error"
  const [editMitarbeiter, setEditMitarbeiter] = useState(null); // New state for editing
  const [currentMitarbeiter, setCurrentMitarbeiter] = useState(null); // Für den Mitarbeiter, der gelöscht werden soll
  const [showConfirmation, setShowConfirmation] = useState(false); // Steuert die Sichtbarkeit der Bestätigungsmeldung


  const fetchAcceptedApplicants = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/accepted-applicants');  // Ein API-Endpunkt, der die Namen der akzeptierten Bewerber zurückgibt
    const data = await response.json();
    setAcceptedApplicants(data);  // Speichere die Bewerberdaten im State
  } catch (error) {
    console.error('Fehler beim Laden der akzeptierten Bewerber:', error);
  }
};
  
  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3001/mitarbeiter");
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Mitarbeiterdaten");
      }
      const data = await response.json();
      setMitarbeiter(data);
    } catch (error) {
      console.error("Fehler beim Laden der Mitarbeiterdaten:", error);
    }
  };

  const fetchUserGroup = async () => {
    try {
      const response = await fetch(`http://localhost:3001/user-group/${user.id}`);
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Benutzergruppe');
      }
      const data = await response.json();
      const { userGroup } = data;
  
      const allowedGroups = ['Administrative Leitung', 'Abteilungsleitung', 'Ausbilder'];
      const allowedGroupsForEdit = ['Administrative Leitung', 'Abteilungsleitung'];

      
      if (allowedGroups.includes(userGroup)) {
        setShowAddButton(true);
      } else {
        setShowAddButton(false);
      }
  
      // Überprüfen, ob der Benutzer die Berechtigung hat, den Edit Button zu sehen
      if (userGroup && allowedGroupsForEdit.includes(userGroup)) {
        setShowEditButton(true);  // Edit Button einblenden
      } else {
        setShowEditButton(false); // Edit Button ausblenden
      }
  
      // Überprüfen, ob der Benutzer zur "Administrative Leitung" gehört, um Löschen anzuzeigen
      if (userGroup === 'Administrative Leitung') {
        setShowDeleteButton(true);  // Delete Button einblenden
      } else {
        setShowDeleteButton(false); // Delete Button ausblenden
      }
  
    } catch (error) {
      setShowAddButton(false);
      setShowEditButton(false); // Kein Zugriff im Fehlerfall
      setShowDeleteButton(false); // Kein Zugriff im Fehlerfall
      console.error('Fehler beim Abrufen der Benutzergruppe:', error);
    }
  };
  

  const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    fetchData();
    fetchAcceptedApplicants(); // Hier den neuen API-Aufruf hinzufügen
    fetchUserGroup();
    const intervalId = setInterval(fetchData, 30000); // Alle 30 Sekunden aktualisieren
    return () => clearInterval(intervalId);
  }, [user.id]);

  const handleSort = (field) => {
    const newSortDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newSortDirection);

    const sortedData = [...mitarbeiter].sort((a, b) => {
      if (a[field] < b[field]) return newSortDirection === "asc" ? -1 : 1;
      if (a[field] > b[field]) return newSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setMitarbeiter(sortedData);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FontAwesomeIcon icon={faSort} />;
    return sortDirection === "asc" ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />;
  };
  
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (editMitarbeiter) {
      setEditMitarbeiter({
        ...editMitarbeiter,
        [name]: type === "checkbox" ? checked : value,
      });
    } else {
      setNeuerMitarbeiter({
        ...neuerMitarbeiter,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch("http://localhost:3001/mitarbeiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...neuerMitarbeiter,
          aktiv: neuerMitarbeiter.aktiv ? 1 : 0,
        }),
        mode: "cors",
      });
      
      const data = await response.json();
  
      if (response.ok && data.success) {
        // Show success message and reset form
        setMessage("Mitarbeiter erfolgreich hinzugefügt!");
        setMessageType("success");
  
        // Clear form fields
        setNeuerMitarbeiter({
          rang: "",
          name: "",
          dienstnummer: "",
          funktion: "",
          aktiv: true,
        });
        
        // Optionally, you could keep the form open for another entry or close it
        setTimeout(() => {
          setMessage(null);  // Clear the message after a few seconds
          fetchData();  // Refresh the list after successful save
        }, 3000);
      } else {
        // Show error message
        setMessage(data.message || "Fehler beim Hinzufügen des Mitarbeiters.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      setMessageType("error");
    }
    fetchData();  // Refresh the list after successful save
  };
  
  

  const handleAddButtonClick = () => {
    
    setShowAddButton(false); // Button verstecken
    setShowForm(true); // Formular anzeigen
  };
  const handleEditButtonClick = (mitarbeiter) => {
    setEditMitarbeiter(mitarbeiter);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!currentMitarbeiter) return; // Sicherheitsüberprüfung

    try {
      const response = await fetch(`http://localhost:3001/mitarbeiter/${currentMitarbeiter.userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
      });

      if (response.ok) {
        setMessage("Mitarbeiter erfolgreich gelöscht!");
        setMessageType("success");
        fetchData(); // Mitarbeiterliste nach Löschung aktualisieren
      } else {
        setMessage("Fehler beim Löschen des Mitarbeiters.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      setMessageType("error");
    } finally {
      setShowConfirmation(false); // Schließt die Bestätigungsmeldung nach dem Löschen
      setCurrentMitarbeiter(null); // Setzt den aktuellen Mitarbeiter zurück
      
    }
  };
  
// Funktion zum Öffnen der Bestätigungsmeldung
const openDeleteConfirmation = (mitarbeiter) => {
  setCurrentMitarbeiter(mitarbeiter); // Setzt den aktuellen Mitarbeiter
  setShowConfirmation(true); // Öffnet die Bestätigungsmeldung
};

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`http://localhost:3001/mitarbeiter/${editMitarbeiter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editMitarbeiter,
          aktiv: editMitarbeiter.aktiv ? 1 : 0,
        }),
        mode: "cors",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Mitarbeiter erfolgreich bearbeitet!");
        setMessageType("success");
        setTimeout(() => {
          setMessage(null);
          setShowForm(false);
          setEditMitarbeiter(null);
          fetchData();
          
        }, 3000);
      } else {
        setMessage(data.message || "Fehler beim Bearbeiten des Mitarbeiters.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      setMessageType("error");
    }
    fetchData();
    //TODO: RELOAD WINDOW NACH ERFOLGREICHEM EDIT -> Button zum ändern verschwindet. Alternativlösung: onClick checken ob Permission da -> Sonst maybe Rechte abuse possible?
    
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} setUser={setUser} />
      <div className="tpd-container">
        <h1>Mitarbeiterliste</h1>
        
        {showAddButton && ( // Button nur anzeigen, wenn showAddButton true ist
          <button className="add-button" onClick={handleAddButtonClick}>
            Mitarbeiter hinzufügen
          </button>
        )}

         {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h1>{editMitarbeiter ? "Mitarbeiter bearbeiten" : "Mitarbeiter hinzufügen"}</h1>
              <button className="close-button" onClick={() => {
                setShowForm(false);
                setShowAddButton(true);
                setEditMitarbeiter(null);
              }}>
                X
              </button>
              {message && (
                <div className={`alert ${messageType === "success" ? "alert-success" : "alert-error"}`}>
                  {message}
                </div>
              )}
              <form onSubmit={editMitarbeiter ? handleEditSubmit : handleSubmit} className="mitarbeiter-formular">
                <div>
                  <label htmlFor="rang">Rang:</label>
                  <select
                    id="rang"
                    name="rang"
                    value={editMitarbeiter ? editMitarbeiter.rang : neuerMitarbeiter.rang}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Bitte wählen</option>
                    <option value="13 - Chief of Police">Chief of Police</option>
                    <option value="12 - Assistant Chief">Assistant Chief</option>
                    <option value="11 - Academy Director">Academy Director</option>
                    <option value="11 - SWAT Commander">SWAT Commander</option>
                    <option value="11 - FBI Director">FBI Director</option>
                    <option value="10 - Assistant Academy Director">Assistant Academy Director</option>
                    <option value="10 - Assistant SWAT Commander">Assistant SWAT Commander</option>
                    <option value="10 - Assistant FBI Director">Assistant FBI Director</option>
                    <option value="09 - Inspector">Inspector</option>
                    <option value="08 - Captain">Captain</option>
                    <option value="07 - Lieutenant">Lieutenant</option>
                    <option value="06 - Staff Sergeant">Staff Sergeant</option>
                    <option value="05 - Sergeant">Sergeant</option>
                    <option value="04 - Corporal">Corporal</option>
                    <option value="03 - Officer II">Officer II</option>
                    <option value="02 - Officer">Officer</option>
                    <option value="01 - Cadet">Cadet</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="name">Name:</label>
                  {editMitarbeiter ? (
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editMitarbeiter.name}
                      readOnly
                    />
                  ) : (
                    <select
                      id="name"
                      name="name"
                      value={neuerMitarbeiter.name}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Bitte wählen</option>
                      {acceptedApplicants.map((applicant) => (
                        <option key={applicant.id} value={applicant.name}>
                          {applicant.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label htmlFor="dienstnummer">Dienstnummer:</label>
                  <input
                    type="text"
                    id="dienstnummer"
                    name="dienstnummer"
                    value={editMitarbeiter ? editMitarbeiter.dienstnummer : neuerMitarbeiter.dienstnummer}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="funktion">Funktion:</label>
                  <select
                    id="funktion"
                    name="funktion"
                    value={editMitarbeiter ? editMitarbeiter.funktion : neuerMitarbeiter.funktion}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Bitte wählen</option>
                    <option value="Administrative Leitung">Administrative Leitung</option>
                    <option value="Abteilungsleitung">Abteilungsleitung</option>
                    <option value="Ausbilder">Ausbilder</option>
                    <option value="SWAT">SWAT</option>
                    <option value="FBI">FBI</option>
                    <option value="Officer">Officer</option>
                  </select>
                </div>

                <div className="aktiv-question">
                  <span>Aktiv?</span>
                  <div className="aktiv-options">
                    <label>
                      <input
                        type="radio"
                        name="aktiv"
                        value="ja"
                        checked={editMitarbeiter ? editMitarbeiter.aktiv === true : neuerMitarbeiter.aktiv === true}
                        onChange={() => {
                          if (editMitarbeiter) {
                            setEditMitarbeiter({ ...editMitarbeiter, aktiv: true });
                          } else {
                            setNeuerMitarbeiter({ ...neuerMitarbeiter, aktiv: true });
                          }
                        }}
                      />
                      Ja
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="aktiv"
                        value="nein"
                        checked={editMitarbeiter ? editMitarbeiter.aktiv === false : neuerMitarbeiter.aktiv === false}
                        onChange={() => {
                          if (editMitarbeiter) {
                            setEditMitarbeiter({ ...editMitarbeiter, aktiv: false });
                          } else {
                            setNeuerMitarbeiter({ ...neuerMitarbeiter, aktiv: false });
                          }
                        }}
                      />
                      Nein
                    </label>
                  </div>
                </div>

                <button type="submit">Speichern</button>
              </form>
          </div>
          </div>
        )}
        <div className="table-wrapper">
        <table className="officer-table">
          <thead>
            <tr>
              <th>
              </th>
              <th>
                Rang 
                <span onClick={() => handleSort("rang")} style={{ cursor: 'pointer', marginLeft: '5px' }}>
                  {getSortIcon("rang")}
                </span>
              </th>
              <th>
                Name 
                <span onClick={() => handleSort("name")} style={{ cursor: 'pointer', marginLeft: '5px' }}>
                  {getSortIcon("name")}
                </span>
              </th>
              <th>
                Dienstnummer 
                <span onClick={() => handleSort("dienstnummer")} style={{ cursor: 'pointer', marginLeft: '5px' }}>
                  {getSortIcon("dienstnummer")}
                </span>
              </th>
              <th>
                Funktion 
                <span onClick={() => handleSort("funktion")} style={{ cursor: 'pointer', marginLeft: '5px' }}>
                  {getSortIcon("funktion")}
                </span>
              </th>
              <th>
                Aktiv 
                <span onClick={() => handleSort("aktiv")} style={{ cursor: 'pointer', marginLeft: '5px' }}>
                  {getSortIcon("aktiv")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {mitarbeiter.map((mitarbeiter) => (
              <tr key={mitarbeiter.id}>
                <td className="rang_icon">
                  {getRankIcon(mitarbeiter.rang) && (
                    <img
                      src={getRankIcon(mitarbeiter.rang)}
                      alt={mitarbeiter.rang}
                      style={{ width: '30px', height: '30px', marginRight: '8px' }}
                    />
                  )}
                </td>
                <td className="rang">
                  {mitarbeiter.rang}
                </td>
                <td>{mitarbeiter.name}</td>
                <td>{mitarbeiter.dienstnummer}</td>
                <td>
                <span 
                style={{
                  backgroundColor: getFunctionBadge(mitarbeiter.funktion).color,
                  color: 'white',
                  borderRadius: '12px',
                  padding: '5px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                      }}
                  >
                  <FontAwesomeIcon
                        icon={getFunctionBadge(mitarbeiter.funktion).icon}
                        style={{ marginRight: '5px' }}
                      />
                      {getFunctionBadge(mitarbeiter.funktion).text}
                    </span>
                  </td>
                  <td>{mitarbeiter.aktiv ? "Ja" : "Nein"}</td>
                  {showEditButton && (
                  <td>
                    <button className="edit-button" onClick={() => handleEditButtonClick(mitarbeiter)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </td>
                  )}
                  {showDeleteButton && (
  <td>
    <button className="delete-button" onClick={() => openDeleteConfirmation(mitarbeiter)}>
      <FontAwesomeIcon icon={faTrash} />
    </button>
  </td>
)}

                </tr>
            ))}
          </tbody>
        </table>
      </div>
       {/* ConsentPopup für das Löschen eines Mitarbeiters */}
       <ConsentPopup
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleDelete}
          message={`Willst du ${currentMitarbeiter ? currentMitarbeiter.name : ''} wirklich löschen?`}
        />
    </div>
    </div>
  );
}

export default TPD;
