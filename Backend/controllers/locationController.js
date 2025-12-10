// Backend/controllers/locationController.js
const express = require('express');
const router = express.Router();
const LocationDAO = require('../models/locationDAO');

// Middleware session
function requireLogin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Connexion requise."
        });
    }
    next();
}

// ===================================
// LOUER UN FILM
// ===================================
router.post('/location', requireLogin, (req, res) => {
    const { filmId } = req.body;

    if (!filmId) {
        return res.status(400).json({ success: false, message: "filmId manquant." });
    }

    LocationDAO.LouerFilm(req.session.userId, filmId, (err, result) => {
        if (err) return res.status(400).json({ success: false, message: err.message });

        res.status(201).json({ success: true, message: result.message });
    });
});

// ===================================
// RETOURNER FILM
// ===================================
router.post('/retour', requireLogin, (req, res) => {
    const { filmId } = req.body;

    if (!filmId) {
        return res.status(400).json({ success: false, message: "filmId manquant." });
    }

    LocationDAO.RetournerFilm(req.session.userId, filmId, (err, result) => {
        if (err) return res.status(400).json({ success: false, message: err.message });

        res.json({ success: true, message: result.message });
    });
});

// ===================================
// MES FILMS LOUÉS
// ===================================
router.get('/mes-films', requireLogin, (req, res) => {
    LocationDAO.ObtenirFilmsLoues(req.session.userId, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({ success: true, data: result });
    });
});

// ===================================
// VÉRIFIER SI DÉJÀ LOUÉ
// ===================================
router.get('/est-loue/:filmId', requireLogin, (req, res) => {
    LocationDAO.EstFilmDejaLoue(req.session.userId, req.params.filmId, (err, isRented) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({ success: true, estLoue: isRented });
    });
});

// ===================================
// COMPTER LOCATIONS
// ===================================
router.get('/compter-locations', requireLogin, (req, res) => {
    LocationDAO.CompterLocationsActives(req.session.userId, (err, count) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({ success: true, count });
    });
});

module.exports = router;
