// Backend/models/userDAO.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

class UserDAO {

    // ===============================
    // 1️⃣ INSCRIPTION
    // ===============================
    static SetInscription({ name, email, password }, callback) {
        const checkSql = "SELECT id FROM users WHERE email = ?";

        db.query(checkSql, [email], (err, rows) => {
            if (err) return callback({ message: "Erreur serveur." });

            if (rows && rows.length > 0) {
                return callback({ message: "Email existe déjà" });
            }

            bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
                if (hashErr) return callback({ message: "Erreur serveur." });

                const insertSql = `
                    INSERT INTO users(name, email, password, date_inscription)
                    VALUES (?, ?, ?, NOW())
                `;

                db.query(insertSql, [name, email, hashedPassword], (insertErr, result) => {
                    if (insertErr) return callback({ message: "Erreur serveur." });

                    callback(null, { id: result.insertId });
                });
            });
        });
    }

    // ===============================
    // 2️⃣ CONNEXION
    // ===============================
    static SetLogin({ email, password }, callback) {
        const sql = "SELECT * FROM users WHERE email = ?";

        db.query(sql, [email], async (err, rows) => {
            if (err) return callback(err);

            if (!rows || rows.length === 0) {
                return callback(null, null);
            }

            const user = rows[0];

            try {
                const match = await bcrypt.compare(password, user.password);
                if (!match) return callback(null, null);

                callback(null, user);
            } catch (e) {
                callback(e);
            }
        });
    }
}

module.exports = UserDAO;
