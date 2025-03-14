// server/index.js (Node.js Backend with Authentication & Guest Server Management)
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
// const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 5000;
const SECRET_KEY = "your_secret_key"; // Change this in production

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(bodyParser.json({ limit: "50mb" })); // Adjust as needed
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));


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
      server_key TEXT,
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
      hardening_report_filename TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(server_id) REFERENCES guest_servers(id)
    )`);
  }
});


const uploadsPath = "./hardening_reports";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + req.body.hardening_report_filename);
  }
});

const file_store = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// app.post("/upload", upload.single("file"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }
//   res.json({ message: "File uploaded successfully", filePath: req.file.path });
// });

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
  console.log(username, password);

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
  console.log(token);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

const authenticateServer = (req, res, next) => {

  const server_key = req.headers["server_key"];
  console.log(server_key);
  if (!server_key) return res.status(401).json({ error: "Unauthorized" });

  if (server_key.split(" ")[1] === "12345678") {
    next();
  } else {

    return res.status(403).json({ error: "Forbidden" });
  }
};

const generateServerKey = (name, os_type, ip_address) => {
  const server_key = jwt.sign({ name: name, os_type: os_type, ip_address: ip_address }, SECRET_KEY, { expiresIn: `${60 * 60 * 24 * 365 * 100}h` });
  return server_key;
}


app.delete("/guest-servers", authenticateToken, (req, res) => {
  console.log(req.body);
  const { server_id } = req.body;
  console.log(server_id);

  db.run("DELETE FROM guest_servers WHERE id = ?", [server_id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Guest server added successfully", id: this.lastID });
  });

  console.log("Added Server");
});

// Add a Guest Server
app.post("/guest-servers", authenticateToken, (req, res) => {
  console.log(req.body);
  const { name, os_type, ip_address } = req.body;
  const server_key = generateServerKey(name, os_type, ip_address);
  console.log(os_type);

  db.run("INSERT INTO guest_servers (name, os_type, server_key, ip_address) VALUES (?, ?, ?, ?)", [name, os_type, server_key, ip_address], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Guest server added successfully", id: this.lastID, server_key: server_key });
  });

  console.log("Added Server");
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
  db.all("SELECT r.*,s.name FROM reports r, guest_servers s WHERE r.server_id=s.id AND server_id = ? ORDER BY timestamp DESC", [req.params.server_id], (err, rows) => {
    if (rows)
      console.log(rows.length)
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(
      rows
    );
  });
});

// Get Hardening Reports for a Specific Server
app.get("/hardening-reports/:server_id", authenticateToken, (req, res) => {
  console.log("Fetching servers...");
  db.all("SELECT r.hardening_report_filename FROM reports r, guest_servers s WHERE r.server_id=s.id AND server_id = ? ORDER BY timestamp DESC", [req.params.server_id], (err, rows) => {
    if (rows)
      console.log(rows.length)
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(
      { "hardening_reports": rows.map((row) => { return row.hardening_report_filename; }) }
    );
  });
});


app.get("/view-report/:filename", (req, res) => {
  const reportPath = path.join(__dirname, uploadsPath, req.params.filename);

  // Check if file exists
  if (!fs.existsSync(reportPath)) {
    return res.status(404).send("Report not found");
  }

  res.sendFile(reportPath);
});



// API to receive reports
app.post("/report", authenticateServer, file_store.single("hardening_report"), (req, res) => {
  // console.log("DAta", req.body);
  const {
    server_id,
    open_ports,
    patch_status,
    antivirus_status,
    encryption_status,
    password_strength,
    third_party_software,
    plaintext_passwords,
  } = req.body;

  const hardening_report_filename = req.file.filename;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  db.run(
    `INSERT INTO reports (
      server_id, open_ports, patch_status, antivirus_status, encryption_status, password_strength, third_party_software, plaintext_passwords, hardening_report_filename
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
      hardening_report_filename,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Report stored successfully", id: this.lastID, filename: hardening_report_filename });
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

