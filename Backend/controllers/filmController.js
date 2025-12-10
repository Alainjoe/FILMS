// Backend/controllers/filmController.js
const express = require('express');
const router = express.Router();
const FilmsDAO = require('../models/filmDAO');

// Middleware connexion
function requireLogin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Vous devez être connecté."
        });
    }
    next();
}

// ===================================
// LISTE FILTRES
// ===================================
router.get('/', requireLogin, (req, res) => {
    const { title, name, genre } = req.query;

    FilmsDAO.getFilmsByFilters({ title, name, genre }, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur serveur films." });

        res.json({ success: true, data: results });
    });
});

// ===================================
// GENRES
// ===================================
router.get('/metadata/genres', requireLogin, (req, res) => {
    FilmsDAO.getAllGenres((err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur chargement genres." });

        res.json({ success: true, data: results.map(g => g.genre) });
    });
});

// ===================================
// POPULAIRES
// ===================================
router.get('/popular', requireLogin, (req, res) => {
    FilmsDAO.getPopularFilms((err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur chargement populaires." });

        res.json({ success: true, data: results });
    });
});

// ===================================
// RÉCENTS
// ===================================
router.get('/recent', requireLogin, (req, res) => {
    FilmsDAO.getRecentFilms((err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur chargement récents." });

        res.json({ success: true, data: results });
    });
});

// ===================================
// RECOMMANDÉS
// ===================================
router.get('/recommended', requireLogin, (req, res) => {
    FilmsDAO.getRecommendedFilms(req.session.userId, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur chargement recommandés." });

        res.json({ success: true, data: results });
    });
});

// ===================================
// RECHERCHE
// ===================================
router.get('/search', requireLogin, (req, res) => {
    const { title, name, genre } = req.query;

    FilmsDAO.getFilmsByFilters({ title, name, genre }, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur recherche." });

        res.json({ success: true, data: results });
    });
});

// ===================================
// FILM PAR ID
// ===================================
router.get('/:id', requireLogin, (req, res) => {
    FilmsDAO.getFilmById(req.params.id, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur serveur." });

        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: "Film non trouvé." });
        }

        res.json({ success: true, data: results[0] });
    });
});

module.exports = router;
