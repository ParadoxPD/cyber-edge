// server/index.js (Node.js Backend with Authentication & Guest Server Management)

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 5000;
const SECRET_KEY = "your_secret_key"; // Change this in production

app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database("security_data.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to SQLite database.");
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS guest_servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      os_type TEXT,
      ip_address TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER,
      open_ports TEXT,
      patch_status TEXT,
      antivirus_status TEXT,
      encryption_status TEXT,
      password_strength TEXT,
      third_party_software TEXT,
      plaintext_passwords TEXT,
      hardening_report TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(server_id) REFERENCES guest_servers(id)
    )`);
  }
});

// User Registration
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function (err) {
    if (err) {
      return res.status(400).json({ error: "User already exists" });
    }
    res.json({ message: "User registered successfully" });
  });
});

// User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
	console.log(username,password);

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "24h" });
    res.json({ token });
  });
});

// Middleware for Authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// Add a Guest Server
app.post("/guest-servers", authenticateToken, (req, res) => {
  const { name, os_type, ip_address } = req.body;

  db.run("INSERT INTO guest_servers (name, os_type, ip_address) VALUES (?, ?, ?)", [name, os_type, ip_address], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Guest server added successfully", id: this.lastID });
  });
});

// Get All Guest Servers
app.get("/guest-servers", authenticateToken, (req, res) => {
	console.log("Fetching servers...");
  db.all("SELECT * FROM guest_servers", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get Reports for a Specific Server
app.get("/reports/:server_id", authenticateToken, (req, res) => {
	console.log("Fetching servers...");
  db.all("SELECT * FROM reports WHERE server_id = ? ORDER BY timestamp DESC", [req.params.server_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API to receive reports
app.post("/report", authenticateToken, (req, res) => {
  const {
    server_id,
    open_ports,
    patch_status,
    antivirus_status,
    encryption_status,
    password_strength,
    third_party_software,
    plaintext_passwords,
    hardening_report,
  } = req.body;

  db.run(
    `INSERT INTO reports (
      server_id, open_ports, patch_status, antivirus_status, encryption_status, password_strength, third_party_software, plaintext_passwords, hardening_report
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      server_id,
      open_ports,
      patch_status,
      antivirus_status,
      encryption_status,
      password_strength,
      third_party_software,
      plaintext_passwords,
      hardening_report,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Report stored successfully", id: this.lastID });
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

