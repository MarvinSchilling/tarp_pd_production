const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OpenIDStrategy = require('passport-openid').Strategy;
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const { pool } = require('./db'); // Pfad zu deiner db.js Datei

const path = require('path'); // Für den Pfad zu den Bildern

// Steam OpenID Strategy
passport.use(new OpenIDStrategy({
  returnURL: 'http://localhost:3001/auth/steam/return',
  realm: 'http://localhost:3001/',
  providerURL: 'https://steamcommunity.com/openid',
  profile: true
},
async (identifier, profile, done) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM loginlist WHERE steam_id = ?',
      [profile.id]
    );

    if (rows.length === 0) {
      // Benutzer existiert nicht, also erstellen wir einen neuen Benutzer
      const [result] = await connection.execute(
        'INSERT INTO loginlist (steam_id, display_name) VALUES (?, ?)',
        [profile.id, profile.displayName]
      );
      const newUser = {
        id: result.insertId,
        steam_id: profile.id,
        display_name: profile.displayName
      };
      connection.release();
      return done(null, newUser);
    }

    const user = rows[0];
    connection.release();
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}
));


const app = express();
const router = express.Router(); // Router initialisieren

// CORS erlauben, um Anfragen vom React-Frontend zu akzeptieren
app.use(cors({
  origin: 'http://localhost:3000',  // React frontend
  credentials: true
}));

// Session Middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// ...
// Statische Dateien bereitstellen (z. B. Bilder im Ordner 'img')
app.use('/images', express.static(path.join(__dirname, 'img')));

// Fetch user group based on userId
router.get('/user-group/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT funktion FROM humanresources WHERE userId = ?',
      [userId],
    );
    connection.release();
    console.log('Funktion:', rows);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Benutzergruppe nicht gefunden.'
      });
    }

    const userGroup = rows[0].funktion;
    res.json({ userGroup });
  } catch (error) {
    console.error('Fehler:', error);
    res.status(500).json({
      success: false,
      message: 'Ein interner Fehler ist aufgetreten.'
    });
  }
});

// Fetch all users
router.get('/users', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT id, name FROM humanresources');
    connection.release();
    res.json({ users: rows });
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Abrufen der Benutzer.' });
  }
});
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware zum Parsen von JSON-Anfragen
app.use(express.json());

// Authentifizierungs-Routen einbinden
app.use('/auth', authRoutes);

// Profile-Picture Route
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user); // Zeigt alle Benutzerinformationen in der Konsole an
    res.json({
      user: {
        id: req.user.id,
        displayName: req.user.displayName,
        avatar: req.user.photos && req.user.photos.length > 0 ? req.user.photos[2].value : null // Avatar-URL
      }
    });
  } else {
    res.json({ user: null });
  }
});

app.post('/logout', (req, res) => {
  // Hier kannst du den Session-Token oder Cookie löschen
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

router.post('/mitarbeiter', async (req, res) => {
    const {rang, name, dienstnummer, funktion, aktiv } = req.body;

    console.log('router.post /mitarbeiter aufgerufen'); // Debugging: Ausgabe des Funktionsaufrufs
    // Debugging: Ausgabe des gesamten Request-Bodys
    console.log('Request Body:', req.body);

    // Validierung der Eingaben
    if (!rang || !name || !dienstnummer || !funktion || (aktiv === undefined)) {
        return res.status(400).json({
            success: false,
            message: 'Bitte füllen Sie alle Felder aus.'
        });
    }
    // Validierung der Dienstnummer (zwischen 01 und 99)
    if (!/^(0[1-9]|[1-9][0-9])$/.test(dienstnummer)) {
        return res.status(400).json({
            success: false,
            message: 'Ungültige Dienstnummer. Bitte geben Sie eine Zahl zwischen 01 und 99 ein.'
       });
    }

    try {
        const connection = await pool.getConnection();

        // 1. Abfrage der `userId` aus der Tabelle `applications` basierend auf dem `ingameName`
        const [rows] = await connection.execute(
            'SELECT userId FROM applications WHERE ingameName = ?',
            [name]
        );

        // Überprüfen, ob die `userId` gefunden wurde
        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Kein Benutzer mit diesem Ingame-Namen gefunden.'
            });
        }

        const userId = rows[0].userId;

        //Validierung der Mitarbeitberliste, ob ein Mitarbeiter bereits existiert, auf Basis aller Daten
        const [nameRows] = await connection.execute(
            'SELECT * FROM humanresources WHERE name = ? OR dienstnummer = ?',
            [name, dienstnummer]
        );
        connection.release();
        if (nameRows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ein Mitarbeiter mit diesem Namen und dieser Dienstnummer existiert bereits.'
            });
        }
        //Logge die Rückgabe der rows
        console.log('Rückgabe der rows:', nameRows);


        // 2. Mitarbeiter in die `humanresources`-Tabelle einfügen
        const valuesToInsert = [userId, rang, name, dienstnummer, funktion, aktiv]; // Werte zum Einfügen
        console.log('Werte zum Einfügen:', valuesToInsert); // Ausgabe der Werte

        const [result] = await connection.execute(
            'INSERT INTO humanresources (userId, rang, name, dienstnummer, funktion, aktiv) VALUES (?, ?, ?, ?, ?, ?)',
            valuesToInsert
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Mitarbeiter erfolgreich hinzugefügt.',
            mitarbeiterId: result.insertId
        });
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Mitarbeiters:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Hinzufügen des Mitarbeiters.',
            error: error.message
        });
    }
});

// DELETE: Benutzer anhand seiner userId löschen
router.delete('/mitarbeiter/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const connection = await pool.getConnection();

      // Löschen des Benutzers aus der Datenbank
      const [result] = await connection.execute(
          'DELETE FROM humanresources WHERE userId = ?',
          [userId]
      );
      connection.release();

      // Prüfen, ob ein Datensatz gelöscht wurde
      if (result.affectedRows === 0) {
          return res.status(404).json({
              success: false,
              message: 'Benutzer nicht gefunden oder konnte nicht gelöscht werden.',
          });
      }

      res.json({
          success: true,
          message: `Benutzer mit ID ${userId} wurde erfolgreich gelöscht.`,
      });
  } catch (error) {
      console.error('Fehler beim Löschen des Benutzers:', error);
      res.status(500).json({
          success: false,
          message: 'Ein interner Fehler ist aufgetreten.',
      });
  }
});



// Mitarbeiter-Rang basierend auf userId abrufen
router.post('/mitarbeiter/rank', async (req, res) => {
  const { userId } = req.body; // userId vom Client erhalten

  try {
    const connection = await pool.getConnection();

    // Hole die Rangdaten des Mitarbeiters basierend auf der userId
    const [rows] = await connection.execute('SELECT rang, funktion, aktiv FROM humanresources WHERE userId = ?', [userId]);
    connection.release();

    if (rows.length > 0) {
      // Cache deaktivieren
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });

      res.json({ rank: rows[0].rang, funktion: rows[0].funktion, aktiv: rows[0].aktiv }); // Rückgabe von Rang und Funktion
    } else {
      res.status(404).json({ success: false, message: 'Mitarbeiter nicht gefunden.' });
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Rangdaten:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Abrufen der Rangdaten.' });
  }
});




// Mitarbeiter abrufen
router.get('/mitarbeiter', async (req, res) => {
  console.log('router.get /mitarbeiter aufgerufen'); // Debugging: Ausgabe des Funktionsaufrufs
  try {
    const connection = await pool.getConnection();
    
    // Füge eine eindeutige ID hinzu, falls sie vorhanden ist (zum Beispiel `id`)
    const [rows] = await connection.execute('SELECT id, userId, rang, name, dienstnummer, funktion, aktiv FROM humanresources');
    connection.release();

    // Cache deaktivieren
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    console.log('Mitarbeiterdaten:', rows); // Debugging: Ausgabe der Mitarbeiterdaten
    res.json(rows);  // Sende die abgerufenen Zeilen zurück
  } catch (error) {
    console.error('Fehler beim Abrufen der Mitarbeiterdaten:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Abrufen der Mitarbeiterdaten.' });
  }
});

router.put('/mitarbeiter/:id', async (req, res) => {
  const { id } = req.params;
  const { rang, name, dienstnummer, funktion, aktiv } = req.body;

  // Debugging: Ausgabe des gesamten Request-Bodys
  console.log('Request Body:', req.body);

  // Validierung der Eingaben
  if (!rang || !name || !dienstnummer || !funktion || (aktiv === undefined)) {
    return res.status(400).json({
      success: false,
      message: 'Bitte füllen Sie alle Felder aus.'
    });
  }

  // Validierung der Dienstnummer (zwischen 01 und 99)
  if (!/^(0[1-9]|[1-9][0-9])$/.test(dienstnummer)) {
    return res.status(400).json({
      success: false,
      message: 'Ungültige Dienstnummer. Bitte geben Sie eine Zahl zwischen 01 und 99 ein.'
    });
  }

  try {
    const connection = await pool.getConnection();

    // Überprüfen, ob der Mitarbeiter existiert
    const [rows] = await connection.execute(
      'SELECT * FROM humanresources WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Mitarbeiter nicht gefunden.'
      });
    }

    // Mitarbeiterdaten aktualisieren
    const [result] = await connection.execute(
      'UPDATE humanresources SET rang = ?, name = ?, dienstnummer = ?, funktion = ?, aktiv = ? WHERE id = ?',
      [rang, name, dienstnummer, funktion, aktiv, id]
    );

    connection.release();

    res.status(200).json({
      success: true,
      message: 'Mitarbeiter erfolgreich bearbeitet.'
    });
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Mitarbeiters:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Bearbeiten des Mitarbeiters.',
      error: error.message
    });
  }
});

// Fetch all trainings with user details
router.get('/all-trainings', async (req, res) => {
  console.log('router.get /all-trainings aufgerufen'); // Debugging: Ausgabe des Funktionsaufrufs
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT t.id, t.title, t.absolviert, t.createdAt, hr.name, hr.rang
      FROM trainings t
      JOIN humanresources hr ON t.userId = hr.userId
    `);
    connection.release();
    res.json({ trainings: rows });
  } catch (error) {
    console.error('Fehler beim Abrufen der Trainings:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Abrufen der Trainings.', error: error.message });
  }
});

// Add a training
router.post('/add-training', async (req, res) => {
  console.log('router.post /add-training aufgerufen'); // Debugging: Ausgabe des Funktionsaufrufs
  const { userId, title } = req.body;
  try {
    console.log('Received add-training request with userId:', userId, 'and title:', title); // Debugging
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO trainings (userId, title, absolviert) VALUES (?, ?, ?)',
      [userId, title, "1"]
    );
    connection.release();
    res.status(201).json({
      success: true,
      message: 'Training erfolgreich hinzugefügt.',
      training: { id: result.insertId, userId, title, absolviert: false }
    });
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Trainings:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Hinzufügen des Trainings.' });
  }
});

// Edit a training
router.put('/edit-training/:id', async (req, res) => {
  console.log('router.put /edit-training/:id aufgerufen'); // Debugging: Ausgabe des Funktionsaufrufs
  const { id } = req.params;
  const { field, value } = req.body;
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `UPDATE trainings SET ${field} = ? WHERE id = ?`,
      [value, id]
    );
    connection.release();
    res.status(200).json({
      success: true,
      message: 'Training erfolgreich bearbeitet.',
      training: { id, [field]: value }
    });
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Trainings:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Bearbeiten des Trainings.' });
  }
});

// Überprüfen, ob eine Bewerbung existiert
router.post('/apply/check', async (req, res) => {
  const { userId } = req.body;

  try {
    const checkQuery = 'SELECT * FROM applications WHERE userId = ?';
    const connection = await pool.getConnection();
    const [results] = await connection.query(checkQuery, [userId]);

    if (results.length > 0) {
      return res.json({ exists: true });
    }

    return res.json({ exists: false });
  } catch (err) {
    console.error('Fehler bei der Überprüfung der Bewerbungen:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Route to create an application
router.post('/apply', async (req, res) => {
  const { userId, faction, ingameName, discordName, applicationText } = req.body;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO applications (userId, faction, ingameName, discordName, applicationText) VALUES (?, ?, ?, ?, ?)',
      [userId, faction, ingameName, discordName, applicationText]
    );
    const applicationId = result.insertId;

    // Create chat entry for the application
    await connection.execute(
      'INSERT INTO chats (application_id, user_id, message) VALUES (?, ?, ?)',
      [applicationId, userId, `Bewerbung von ${ingameName} eingereicht.`]
    );

    connection.release();
    res.json({ success: true, message: 'Bewerbung erfolgreich gespeichert.' });
  } catch (error) {
    console.error('Fehler beim Speichern der Bewerbung:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Speichern der Bewerbung.' });
  }
});


// Bewerbung abrufen
router.get('/apply', async (req, res) => {
  const { userId } = req.query; // Benutzer-ID aus der Abfrage abrufen

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT faction, ingameName, discordName, applicationText,status FROM applications WHERE userId = ?', [userId]);
    connection.release();

    res.json(rows);  // Sende die abgerufenen Bewerbungen zurück
  } catch (error) {
    console.error('Fehler beim Abrufen der Bewerbungen:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Abrufen der Bewerbungen.' });
  }
});


app.get('/apply', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const query = 'SELECT * FROM applications'; // SQL-Abfrage, um alle Bewerbungen abzurufen
    const [results] = await connection.query(query);
    res.json(results);
  } catch (error) {
    console.error('Datenbankfehler:', error);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

app.post('/check-access', async (req, res) => {
  const { userId } = req.body; // Benutzer-ID aus dem Request
  const connection = await pool.getConnection();

  // Überprüfen, ob der Benutzer eine der erforderlichen Funktionen hat
  const query = `
      SELECT * FROM humanresources 
      WHERE userId = ? AND funktion IN ('Administrative Leitung', 'Abteilungsleitung', 'Ausbilder') AND funktion IS NOT NULL
  `;
  const [result] = await connection.execute(query, [userId]);
  if (result.length > 0) {
      return res.json({ hasAccess: true }); // Zugriff gewährt
  } else {
      return res.json({ hasAccess: false }); // Zugriff verweigert
  }
});

app.post('/check-access-records', async (req, res) => {
  const { userId } = req.body; // Benutzer-ID aus dem Request

  if (userId === undefined) {
    return res.status(400).json({ error: 'Benutzer-ID ist erforderlich.' });
  }

  try {
    const connection = await pool.getConnection();

    // Überprüfen, ob der Benutzer eine der erforderlichen Funktionen hat
    const query = `
      SELECT * FROM humanresources
      WHERE userId = ? AND funktion IN ('Administrative Leitung', 'Abteilungsleitung', 'Ausbilder', 'SWAT', 'FBI', 'Officer') AND funktion IS NOT NULL
    `;
    const [result] = await connection.execute(query, [userId]);
    connection.release();

    if (result.length > 0) {
      return res.json({ hasAccess: true }); // Zugriff gewährt
    } else {
      return res.json({ hasAccess: false }); // Zugriff verweigert
    }
  } catch (error) {
    console.error('Fehler beim Überprüfen des Zugriffs:', error);
    res.status(500).json({ error: 'Fehler beim Überprüfen des Zugriffs.' });
  }
});


app.get('/api/accepted-applicants', async (req, res) => {
  const connection = await pool.getConnection();
  const query = 'SELECT a.ingameName AS name, a.userId  FROM applications a  WHERE a.status = 1  AND a.userId NOT IN (  SELECT hr.userId  FROM humanresources hr  )';
  const [rows] = await connection.execute(query);
  res.json(rows);
});

router.get('/user-group/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
          'SELECT funktion FROM humanresources WHERE userId = ?',
          [userId],
      );
      connection.release();
      console.log('Funktion:', rows);

      if (rows.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'Benutzergruppe nicht gefunden.'
          });
      }

      const userGroup = rows[0].funktion;
      res.json({ userGroup });
  } catch (error) {
      console.error('Fehler:', error);
      res.status(500).json({
          success: false,
          message: 'Ein interner Fehler ist aufgetreten.'
      });
  }
});


// Serialisierung und Deserialisierung des Benutzers
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM loginlist WHERE id = ?',
      [id]
    );
    connection.release();

    if (rows.length === 0) {
      return done(null, false);
    }

    const user = rows[0];
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Authentifizierungsrouten
router.get('/auth/steam', passport.authenticate('openid'));

router.get('/auth/steam/return', 
  passport.authenticate('openid', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Beispiel für eine geschützte Route
router.get('/chat/:applicationId', (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
}, async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user.id; // Assuming you have user authentication

  try {
    const connection = await pool.getConnection();

    // Check if the user is allowed to see the chat
    const [userRows] = await connection.execute(
      'SELECT funktion FROM humanresources WHERE userId = ?',
      [userId]
    );

    const userRole = userRows[0]?.funktion;

    // Check if the user is the creator of the application
    const [applicationRows] = await connection.execute(
      'SELECT userId FROM applications WHERE id = ?',
      [applicationId]
    );

    const applicationCreatorId = applicationRows[0]?.userId;

    if (!['Administrative Leitung', 'Abteilungsleitung', 'Ausbilder'].includes(userRole) && userId !== applicationCreatorId) {
      connection.release();
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Fetch chat messages along with name
    const [chatRows] = await connection.execute(
      `SELECT chats.id, chats.message, humanresources.name
       FROM chats
       JOIN humanresources ON chats.user_id = humanresources.userId
       WHERE chats.application_id = ?`,
      [applicationId]
    );

    connection.release();
    res.json({ success: true, chat: chatRows });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ success: false, message: 'Error fetching chat' });
  }
});
  // Route to send a message in a chat
router.post('/chat/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  const { message } = req.body;
  const userId = req.user.id; // Assuming you have user authentication

  try {
    const connection = await pool.getConnection();

    // Check if the user is allowed to send messages
    const [userRows] = await connection.execute(
      'SELECT funktion FROM humanresources WHERE userId = ?',
      [userId]
    );

    const userRole = userRows[0]?.funktion;

    // Check if the user is the creator of the application
    const [applicationRows] = await connection.execute(
      'SELECT userId FROM applications WHERE id = ?',
      [applicationId]
    );

    const applicationCreatorId = applicationRows[0]?.userId;

    if (!['Administrative Leitung', 'Abteilungsleitung', 'Ausbilder'].includes(userRole) && userId !== applicationCreatorId) {
      connection.release();
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Insert the message into the database
    await connection.execute(
      'INSERT INTO chats (application_id, user_id, message) VALUES (?, ?, ?)',
      [applicationId, userId, message]
    );

    connection.release();
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
});

// Route to update a message in a chat
router.put('/chat/:messageId', async (req, res) => {
  const { messageId } = req.params;
  const { message } = req.body;
  const userId = req.user.id; // Assuming you have user authentication

  try {
    const connection = await pool.getConnection();

    // Check if the user is allowed to update messages
    const [userRows] = await connection.execute(
      'SELECT funktion FROM humanresources WHERE userId = ?',
      [userId]
    );

    const userRole = userRows[0]?.funktion;

    // Check if the user is the creator of the application
    const [applicationRows] = await connection.execute(
      'SELECT userId FROM applications WHERE id = (SELECT application_id FROM chats WHERE id = ?)',
      [messageId]
    );

    const applicationCreatorId = applicationRows[0]?.userId;

    if (!['Administrative Leitung', 'Abteilungsleitung', 'Ausbilder'].includes(userRole) && userId !== applicationCreatorId) {
      connection.release();
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Update the message in the database
    await connection.execute(
      'UPDATE chats SET message = ? WHERE id = ? AND user_id = ?',
      [message, messageId, userId]
    );

    // Fetch the ingameName of the user
    const [nameRows] = await connection.execute(
      'SELECT ingameName FROM applications WHERE userId = ?',
      [userId]
    );

    const ingameName = nameRows[0]?.ingameName || 'Unknown';

    connection.release();
    res.json({ success: true, message: 'Message updated', ingameName });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ success: false, message: 'Error updating message' });
  }
});

// Neue Route zum Abrufen des ingameName des Bewerbers
router.get('/application/:applicationId', async (req, res) => {
  const { applicationId } = req.params;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT ingameName FROM applications WHERE id = ?',
      [applicationId]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const ingameName = rows[0].ingameName;
    connection.release();
    res.json({ success: true, ingameName });
  } catch (error) {
    console.error('Error fetching applicant name:', error);
    res.status(500).json({ success: false, message: 'Error fetching applicant name' });
  }
});

// Route to update the status of an application
router.put('/application/:applicationId/status', async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );
    connection.release();
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
});

// Route zum Abrufen der Strafakten
app.get('/criminal-records', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [records] = await connection.query('SELECT * FROM criminal_records');
    connection.release();
    res.json(records);
  } catch (error) {
    console.error('Fehler beim Abrufen der Strafakten:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Strafakten.' });
  }
});

// Route zum Hinzufügen einer neuen Strafakte
app.post('/criminal-records', async (req, res) => {
  const { userId, accusedName, description, date } = req.body;
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO criminal_records (userId, accusedName, description, date) VALUES (?, ?, ?, ?)',
      [userId, accusedName, description, date]
    );
    connection.release();
    res.status(201).json({ message: 'Strafakte erfolgreich hinzugefügt.' });
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Strafakte:', error);
    res.status(500).json({ message: 'Fehler beim Hinzufügen der Strafakte.' });
  }
});




// Verwende den Router
app.use('/', router);

// Starte den Server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

