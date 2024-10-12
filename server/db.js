const mysql = require('mysql2/promise'); // Importiere mysql2/promise

const pool = mysql.createPool({
  host: 'localhost', // deine Datenbank Hostadresse
  user: 'root', // dein Datenbank Benutzername
  password: 'secret', // dein Datenbank Passwort
  database: 'tpd' // der Name deiner Datenbank
});

// Funktion, um die Tabelle zu überprüfen und zu erstellen
const  checkAndCreateTable = async() => {

  const createLoginTableQuery = `
    CREATE TABLE IF NOT EXISTS loginlist (
      userId CHAR(17) PRIMARY KEY,
      Displayname VARCHAR(255) NOT NULL
    )
  `; // SQL-Query zum Erstellen der Loginliste

  const createApplicationsTableQuery = `
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId CHAR(17) NOT NULL,
      faction VARCHAR(255) NOT NULL,
      ingameName VARCHAR(255) NOT NULL,
      discordName VARCHAR(255) NOT NULL,
      applicationText TEXT NOT NULL,
      status BOOLEAN,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES loginlist(userId) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `; // SQL-Query zum Erstellen der Bewerbungsliste
  const createHumanResourcesTableQuery = `
    CREATE TABLE IF NOT EXISTS humanresources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId CHAR(17) NOT NULL,
      rang VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      dienstnummer VARCHAR(2) NOT NULL,
      funktion VARCHAR(255) NOT NULL,
      aktiv BOOLEAN NOT NULL,
      FOREIGN KEY (userId) REFERENCES applications(userId) ON DELETE CASCADE ON UPDATE CASCADE
      )
  `; // SQL-Query zum Erstellen der Mitarbeiterliste

  const createTrainingsTableQuery = `
  CREATE TABLE IF NOT EXISTS trainings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId CHAR(17) NOT NULL,
    title VARCHAR(255) NOT NULL,
    absolviert BOOLEAN NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES loginlist(userId) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `; // SQL-Query zum Erstellen der Trainingsliste

  const createChatTableQuery = `
  CREATE TABLE IF NOT EXISTS chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    user_id CHAR(17) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES loginlist(UserId) ON DELETE CASCADE ON UPDATE CASCADE
  )
  `; // SQL-Query zum Erstellen der Tabelle für Chats

  const createCriminalRecordsTableQuery = `
    CREATE TABLE IF NOT EXISTS criminal_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId CHAR(17) NOT NULL,
      accusedName VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      date DATE NOT NULL,
      FOREIGN KEY (userId) REFERENCES loginlist(userId) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `; // SQL-Query zum Erstellen der Tabelle für Strafakten

  // Füg doch noch mehr hinzu, bitti :)

  try {
    const connection = await pool.getConnection();
    await connection.query(createLoginTableQuery); // Tabelle für Logins erstellen
    await connection.query(createApplicationsTableQuery); // Tabelle für Bewerbungen erstellen
    await connection.query(createHumanResourcesTableQuery); // Tabelle für Mitarbeiter erstellen
    await connection.query(createTrainingsTableQuery); // Tabelle für Trainings erstellen
    await connection.query(createChatTableQuery); // Tabelle für Chats erstellen
    await connection.query(createCriminalRecordsTableQuery); // Tabelle für Strafakten erstellen
    connection.release();
    console.log('Tabelle "loginlist", "humanresources","application", "applicationChat" und "trainings" überprüft/erstellt.');
  } catch (err) {
    console.error('Fehler bei der Überprüfung/Erstellung der Tabellen:', err);
    throw err;
  }
};

module.exports = { pool, checkAndCreateTable }; // Exportiere den Pool (Return Statement)