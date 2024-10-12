import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importiere useNavigate für die Umleitung
import Sidebar from './Sidebar'; // Sidebar importieren
import Notification from './Notification'; // Notification importieren
import './Apply.css'; // Angepasstes CSS

function Apply() {
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null);
  const [applicationText, setApplicationText] = useState(''); // Bewerbungstext
  const [error, setError] = useState(''); // Fehler für Sonderzeichen
  const [message, setMessage] = useState('');  // Nachricht für Erfolg oder Fehler
  const [messageType, setMessageType] = useState('');  // Art der Nachricht (success oder error)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);  // Zustand für den gesperrten Button
  
  const navigate = useNavigate();  // Verwende useNavigate für die Umleitung

  const [formValues, setFormValues] = useState({
    faction: '',
    ingameName: '',
    discordName: '',
    meetsRequirements: false, // Zustand für die Checkbox
  });

  useEffect(() => {
    fetch('http://localhost:3001/user', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          console.log('Benutzer nicht gefunden'); // Debugging-Zeile
        }
      });
  }, []);

  const handleTextChange = (e) => {
    const inputText = e.target.value;
    const invalidChars = /[^a-zA-Z0-9 .,!?()]/g;

    if (invalidChars.test(inputText)) {
      setError('Bitte verwenden Sie keine Sonderzeichen.');
    } else {
      setError('');
      setApplicationText(inputText);
    }
  };

  const handleFormChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (type === 'checkbox') {
      setFormValues((prevValues) => ({ ...prevValues, [name]: checked }));
    } else {
      setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setMessage(''); // Nachricht zurücksetzen
        setCurrentStep((prevStep) => prevStep + 1); // Gehe zum nächsten Schritt
      } else {
        console.log('Letzter Schritt erreicht, Bewerbung wird abgeschickt.'); // Debugging-Zeile
        handleSubmit(); // Bewerbung absenden
      }
    } else {
      setMessage("Bitte füllen Sie alle erforderlichen Felder aus.");  // Warnung bei ungültigen Eingaben
      setMessageType("error");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = () => {
    console.log('Aktueller Schritt:', currentStep); // Debugging-Zeile
    console.log('Formularwerte:', formValues); // Debugging-Zeile
    console.log('Bewerbungstext:', applicationText); // Debugging-Zeile

    if (currentStep === 0) {
      console.log('Überprüfe Schritt 1: meetsRequirements', formValues.meetsRequirements);
      return formValues.meetsRequirements; // Überprüfe die Checkbox
    } else if (currentStep === 1) {
      console.log('Überprüfe Schritt 2: faction', formValues.faction);
      return formValues.faction !== '';
    } else if (currentStep === 2) {
      console.log('Überprüfe Schritt 3: ingameName und discordName', formValues.ingameName, formValues.discordName);
      return formValues.ingameName !== '' && formValues.discordName !== '';
    } else if (currentStep === 3) {
      console.log('Überprüfe Schritt 4: applicationText', applicationText);
      return applicationText.trim() !== '';
    }
    return true; // Für den letzten Schritt
  };

  const handleSubmit = () => {
    console.log('handleSubmit wurde aufgerufen'); // Debugging-Zeile
    setIsButtonDisabled(true);  // Button deaktivieren
    const applicationData = {
      userId: user?.id,
      faction: formValues.faction,
      ingameName: formValues.ingameName,
      discordName: formValues.discordName,
      applicationText,
    };

    console.log('Daten, die gesendet werden:', applicationData);

    fetch('http://localhost:3001/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMessage('Bewerbung erfolgreich gesendet!');
          setMessageType('success');

          setTimeout(() => {
            setIsButtonDisabled(false);  // Button wieder aktivieren
            navigate('/dashboard');  // Leite auf das Dashboard um
          }, 5000);
        } else {
          setMessage('Fehler: ' + data.message);
          setMessageType('error');
          setIsButtonDisabled(false);  // Button wieder aktivieren
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setMessage('Fehler: ' + data.message);
        setMessageType('error');
        setIsButtonDisabled(false);  // Button wieder aktivieren
      });
  };

  const steps = [
    {
      title: 'Bewerbungsvoraussetzungen',
      content: (
        <div className="input-section">
          <h3>Schritt 1: Voraussetzungen</h3>
          <p>Du spielst mindestens seit 4 Wochen auf TARP und hast mindestens 40 aktive Spielstunden.</p>
          <label>
            <input
              type="checkbox"
              name="meetsRequirements"
              required
              checked={formValues.meetsRequirements}
              onChange={handleFormChange}
            />
            Ich erfülle die Voraussetzungen.
          </label>
        </div>
      ),
    },
    {
      title: 'Art der Bewerbung',
      content: (
        <div className="input-section">
          <h3>Schritt 2: Art der Bewerbung</h3>
          <label htmlFor="faction">Wählen Sie Ihre Fraktion:</label>
          <select id="faction" name="faction" required value={formValues.faction} onChange={handleFormChange}>
            <option value="">Bitte wählen...</option>
            <option value="hauptfraktionist">Allgemeine Bewerbung</option>
            <option value="zweitfraktionist">Versetzungsantrag</option>
          </select>
        </div>
      ),
    },
    {
      title: 'Unterlagen',
      content: (
        <div className="input-section">
          <h3>Schritt 3: Unterlagen</h3>
          <p>Füge hier die benötigten Informationen hinzu, wie z.B. deinen Ingame- und Discordnamen</p>
          <input
            type="text"
            name="ingameName"
            placeholder="Ingame-Name"
            className="text-input"
            value={formValues.ingameName}
            onChange={handleFormChange}
          />
          <input
            type="text"
            name="discordName"
            placeholder="Discord-Name"
            className="text-input"
            value={formValues.discordName}
            onChange={handleFormChange}
          />
        </div>
      ),
    },
    {
      title: 'Bewerbungsschreiben',
      content: (
        <div className="input-section">
          <h3>Schritt 4: Bewerbungsschreiben</h3>
          <textarea
            rows="10"
            placeholder="Schreiben Sie hier Ihr Bewerbungsschreiben..."
            value={applicationText}
            onChange={handleTextChange}
            className="application-textarea"
          />
          {error && <p className="error-text">{error}</p>}
        </div>
      ),
    },
  ];

  return (
    <div className="apply-container">
      <Sidebar user={user} setUser={setUser} />

      <div className="apply-content">
        <h1>Bewerben</h1>

        <div className="apply-content-wrapper">
          {/* Vertikaler Schritt-Fortschritt */}
          <div className="apply-steps-vertical">
            {steps.map((step, index) => (
              <div key={index} className="step-box-vertical-container">
                <div className={`step-box-vertical ${currentStep > index ? 'completed' : ''} ${currentStep === index ? 'active' : ''}`}>
                  {currentStep > index ? <span className="checkmark">&#10003;</span> : (index + 1)}
                </div>
                <span className="step-label">{step.title}</span> {/* Schritt-Namen hinzugefügt */}
              </div>
            ))}
          </div>

          {/* Formulareingaben */}
          <div className="apply-form">
            {steps[currentStep].content}

            {/* Nachricht für Erfolg oder Fehler */}
            {message && (
              <div className={`message ${messageType === "success" ? "message-success" : "message-error"}`}>
                {message}
              </div>
            )}

            <div className="form-buttons">
              <button className="back-btn" onClick={prevStep} disabled={currentStep === 0}>
                Zurück
              </button>
              <button className="submit-btn" onClick={nextStep} disabled={isButtonDisabled}>
                {currentStep === steps.length - 1 ? 'Bewerbung absenden' : 'Weiter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Apply;