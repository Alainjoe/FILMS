const db = require('../config/db');
const bcrypt = require('bcrypt');

class ProfilDAO {

    // ===============================
    // Profil utilisateur
    // ===============================
    static getUserProfile(userId, callback) {
        const sql = `
            SELECT id, name, email, date_inscription
            FROM users
            WHERE id = ?
        `;
        db.query(sql, [userId], (err, res) => {
            if (err) return callback(err);
            callback(null, res[0] || null);
        });
    }

    // ===============================
    // Films loués
    // ===============================
    static getUserRentals(userId, callback) {
        const sql = `
            SELECT 
                r.id AS rental_id,
                r.film_id,
                f.title AS film_title,
                r.rental_date,
                r.return_date,
                CASE WHEN r.return_date IS NULL 
                    THEN 'En cours'
                    ELSE 'Retourné'
                END AS statut
            FROM rentals r
            JOIN films f ON r.film_id = f.id
            WHERE r.user_id = ?
            ORDER BY r.rental_date DESC
        `;
        db.query(sql, [userId], callback);
    }

    // ===============================
    // Modifier mot de passe
    // ===============================
    static updatePasswordWithVerification(userId, current, newPass, callback) {
        const sql = "SELECT password FROM users WHERE id = ?";

        db.query(sql, [userId], async (err, res) => {
            if (err) return callback({ message: "Erreur serveur" });

            if (!res.length)
                return callback({ message: "Utilisateur introuvable" });

            const match = await bcrypt.compare(current, res[0].password);
            if (!match)
                return callback({ message: "Mot de passe incorrect" });

            const hash = await bcrypt.hash(newPass, 10);

            db.query("UPDATE users SET password = ? WHERE id = ?", [hash, userId], err2 => {
                if (err2) return callback({ message: "Erreur serveur" });

                callback(null, { message: "Mot de passe changé" });
            });
        });
    }

    // ===============================
    // Modifier profil (nom + email)
    // ===============================
    static updateProfile(userId, { name, email }, callback) {
        const sqlCheck = "SELECT id FROM users WHERE email = ? AND id != ?";

        db.query(sqlCheck, [email, userId], (err, rows) => {
            if (err) return callback({ message: "Erreur serveur" });

            if (rows.length > 0) {
                return callback({ message: "Email déjà utilisé" });
            }

            const sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
            db.query(sql, [name, email, userId], err2 => {
                if (err2) return callback({ message: "Erreur serveur" });

                callback(null, { message: "Profil mis à jour" });
            });
        });
    }

    // ===============================
    // Supprimer compte (version CASCADE)
    // ===============================
    static deleteAccount(userId, callback) {
        const sql = `
            DELETE FROM users WHERE id = ?
        `;

        db.query(sql, [userId], (err, result) => {
            if (err) {
                console.log("Erreur suppression utilisateur :", err);
                return callback({ message: "Erreur serveur" });
            }

            if (result.affectedRows === 0) {
                return callback({ message: "Utilisateur introuvable" });
            }

            // Rentals sont supprimés automatiquement grâce à ON DELETE CASCADE
            callback(null, { message: "Compte supprimé" });
        });
    }
}

module.exports = ProfilDAO;
