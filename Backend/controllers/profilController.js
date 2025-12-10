// Backend/controllers/profilController.js
const express = require('express');
const router = express.Router();
const ProfilDAO = require('../models/profilDAO');

// Middleware protection
function isAuthenticated(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Non autorisé. Connectez-vous."
        });
    }
    next();
}

// ===================================
// PROFIL
// ===================================
router.get('/', isAuthenticated, (req, res) => {
    ProfilDAO.getUserProfile(req.session.userId, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur profil." });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur introuvable."
            });
        }

        res.json({ success: true, data: result });
    });
});

// ===================================
// MES FILMS
// ===================================
router.get('/mesfilms', isAuthenticated, (req, res) => {
    ProfilDAO.getUserRentals(req.session.userId, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur films loués." });

        res.json({ success: true, data: result });
    });
});

// ===================================
// UPDATE MOT DE PASSE
// ===================================
router.put('/password', isAuthenticated, (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Champs manquants." });
    }

    ProfilDAO.updatePasswordWithVerification(
        req.session.userId,
        currentPassword,
        newPassword,
        (err, result) => {
            if (err) return res.status(400).json({ success: false, message: err.message });

            res.json({ success: true, message: result.message });
        }
    );
});

// ===================================
// UPDATE PROFIL
// ===================================
router.put('/', isAuthenticated, (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ success: false, message: "Nom et email requis." });
    }

    ProfilDAO.updateProfile(req.session.userId, { name, email }, (err, result) => {
        if (err) return res.status(400).json({ success: false, message: err.message });

        res.json({ success: true, message: result.message });
    });
});

// ===================================
// SUPPRESSION COMPTE (CORRECTE)
// ===================================
router.delete('/delete', isAuthenticated, (req, res) => {
    ProfilDAO.deleteAccount(req.session.userId, (err, result) => {
        if (err) return res.status(400).json({ success: false, message: err.message });

        req.session.destroy(() => {
            res.clearCookie("session_id");
            res.json({ success: true, message: result.message });
        });
    });
});

// (Tu peux laisser l'ancienne route si tu veux, mais elle ne sera pas utilisée)
module.exports = router;
