require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();


// LES MIDDLEWARES

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// SESSION

app.use(session({
    name: process.env.SESSION_SECRET,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7 // AGE DES SESSION 7 JOURS
    }
}));

// L'ADRESSE POUR DEMARRER LE FRONTEND
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));


// DEFINIR LE CHEMIN VERS LE FRONT END

const FRONTEND_DIR = path.join(__dirname, "../Frontend/view");
app.use(express.static(FRONTEND_DIR));


// LES ROUTES 

app.use("/api/auth", require("./controllers/userController"));
app.use("/api/films", require("./controllers/filmController"));
app.use("/api/profil", require("./controllers/profilController"));
app.use("/api/location", require("./controllers/locationController"));
app.use("/api/rentals", require("./controllers/locationController"));


// LES ROUTES POUR LES DIFFERENTS PAGES DU FRONTEND

app.get("/", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "html", "login.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "html", "login.html"));
});

app.get("/catalogue", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "html", "index.html"));
});

app.get("/mesfilms", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "html", "mesfilms.html"));
});

app.get("/profil", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "html", "profil.html"));
});

app.get("/filmdetails", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "html", "filmdetails.html"));
});

app.get("/inscription", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "html", "inscription.html"));
});


// GESTIONS DES ERREURS

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route non trouvée" });
});

app.use((err, req, res, next) => {
    console.error("Erreur serveur :", err.stack);
    res.status(500).json({ success: false, message: "Erreur serveur interne" });
});

// LE DEMARRAGE DU SERVEUR EXPRESS

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé : http://localhost:${PORT}`);
});
