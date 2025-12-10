// Backend/controllers/userController.js
const express = require('express');
const router = express.Router();
const UserDAO = require('../models/userDAO');

// ===============================
// INSCRIPTION
// ===============================
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Nom, email et mot de passe sont requis."
        });
    }

    UserDAO.SetInscription({ name, email, password }, (err, result) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: "Inscription réussie.",
            userId: result.id
        });
    });
});

// ===============================
// CONNEXION
// ===============================
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email et mot de passe sont requis."
        });
    }

    UserDAO.SetLogin({ email, password }, (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Erreur serveur."
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Identifiants incorrects."
            });
        }

        // Sauvegarde session
        req.session.userId = user.id;
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        req.session.save(() => {
            res.json({
                success: true,
                message: "Connexion réussie.",
                user: req.session.user
            });
        });
    });
});

// ===============================
// DÉCONNEXION
// ===============================
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la déconnexion."
            });
        }

        res.clearCookie("session_id");
        res.json({ success: true, message: "Déconnecté." });
    });
});

// ===============================
// VÉRIFICATION SESSION
// ===============================
router.get('/check-session', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Non connecté."
        });
    }

    res.json({
        success: true,
        user: req.session.user
    });
});

module.exports = router;
