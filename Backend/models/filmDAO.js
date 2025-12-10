// Backend/models/filmDAO.js
const db = require('../config/db');

class FilmsDAO {

    // ===============================
    // Tous les films
    // ===============================
    static getAllFilms(callback) {
        db.query("SELECT * FROM films", callback);
    }

    // ===============================
    // Genres distincts
    // ===============================
    static getAllGenres(callback) {
        const sql = `
            SELECT DISTINCT genre 
            FROM films
            WHERE genre IS NOT NULL AND genre <> ''
            ORDER BY genre ASC
        `;
        db.query(sql, callback);
    }

    // ===============================
    // Films populaires
    // ===============================
    static getPopularFilms(callback) {
        const sql = `
            SELECT 
                f.*, 
                COUNT(r.id) AS nb_locations
            FROM films f
            LEFT JOIN rentals r ON f.id = r.film_id
            GROUP BY f.id
            ORDER BY nb_locations DESC
            LIMIT 10
        `;
        db.query(sql, callback);
    }

    // ===============================
    // Films récents
    // ===============================
    static getRecentFilms(callback) {
        db.query(`
            SELECT * 
            FROM films 
            ORDER BY annee_sortie DESC 
            LIMIT 10
        `, callback);
    }

    // ===============================
    // Recommandations
    // ===============================
    static getRecommendedFilms(userId, callback) {
        db.query(`
            SELECT * 
            FROM films 
            ORDER BY RAND()
            LIMIT 10
        `, callback);
    }

    // ===============================
    // Recherche par filtres
    // ===============================
    static getFilmsByFilters(filters, callback) {
        let sql = "SELECT * FROM films WHERE 1=1";
        const params = [];

        if (filters.title) {
            sql += " AND title LIKE ?";
            params.push(`%${filters.title}%`);
        }

        if (filters.name) {
            sql += " AND (acteurs LIKE ? OR realisateurs LIKE ?)";
            params.push(`%${filters.name}%`, `%${filters.name}%`);
        }

        if (filters.genre) {
            sql += " AND genre LIKE ?";
            params.push(`%${filters.genre}%`);
        }

        db.query(sql, params, callback);
    }

    // ===============================
    // Film par ID
    // ===============================
    static getFilmById(id, callback) {
        db.query("SELECT * FROM films WHERE id = ?", [id], callback);
    }
}

module.exports = FilmsDAO;
