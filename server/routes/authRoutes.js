const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const { pool, checkAndCreateTable } = require('../db'); // Funktion zum Überprüfen und Erstellen der Tabelle
const router = express.Router();

// Steam API Key und Rückruf-URL konfigurieren
passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3001/auth/steam/return',
    realm: 'http://localhost:3001/',
    apiKey: '4E939ADE77A0CC0D666935FBB919EB34'  // Steam API Key hier einfügen
  },
  function(identifier, profile, done) {
    // Hier kannst du den Benutzer speichern oder verarbeiten
    return done(null, profile);
  }
));

// Session serialisieren
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Steam Auth Route - Login
router.get('/steam', passport.authenticate('steam'));

// Steam Auth Callback - nach erfolgreichem Login
router.get('/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  async (req, res) => {
    const userId = req.user.id; // Steam-ID
    const Displayname = req.user.displayName; // Steam-Name

    try {
      // Überprüfen/Erstellen der Tabelle
      await checkAndCreateTable();

      // Überprüfen, ob der Benutzer bereits in der Datenbank vorhanden ist
      const checkQuery = 'SELECT * FROM loginlist WHERE userId = ?';
      const connection = await pool.getConnection();
      const [rows] = await connection.query(checkQuery, [userId]);

      if (rows.length > 0) {
        // Benutzer ist bereits in der Datenbank, überspringen des Speicherns
        console.log(`Benutzer mit userId: ${userId} ist bereits vorhanden, überspringe das Speichern.`);
      } else {
        // Benutzer ist nicht vorhanden, Daten speichern
        const insertQuery = 'INSERT INTO loginlist (userId, Displayname) VALUES (?, ?)';
        await connection.query(insertQuery, [userId, Displayname]);
        console.log(`Steam-Daten von ${Displayname} erfolgreich gespeichert.`);
      }

      connection.release();

      res.redirect('http://localhost:3000'); // Weiterleitung zum Frontend
    } catch (err) {
      console.error('Fehler beim Speichern der Steam-Daten:', err);
      res.status(500).send('Fehler beim Speichern der Daten.');
    }
  }
);

// Logout Route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000'); // Leite auf das Frontend nach Logout
  });
});

module.exports = router;
