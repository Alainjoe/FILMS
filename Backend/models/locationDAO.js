// Backend/models/locationDAO.js
const db = require('../config/db');

class LocationDAO {

    // ======================================================
    // 1️⃣ LOUER UN FILM
    // ======================================================
    static LouerFilm(userId, filmId, callback) {

        db.getConnection((err, conn) => {
            if (err) return callback({ message: "Erreur connexion DB" });

            conn.beginTransaction(err => {
                if (err) {
                    conn.release();
                    return callback({ message: "Erreur transaction" });
                }

                // Limite de 5 films
                const sqlCount = `
                    SELECT COUNT(*) AS total
                    FROM rentals
                    WHERE user_id = ? AND return_date IS NULL
                `;
                conn.query(sqlCount, [userId], (err, resCount) => {
                    if (err) {
                        conn.rollback(() => conn.release());
                        return callback({ message: "Erreur limite" });
                    }

                    if (resCount[0].total >= 5) {
                        conn.rollback(() => conn.release());
                        return callback({ message: "Maximum 5 films loués" });
                    }

                    // Déjà loué ?
                    const sqlDup = `
                        SELECT id FROM rentals
                        WHERE user_id = ? AND film_id = ? AND return_date IS NULL
                    `;
                    conn.query(sqlDup, [userId, filmId], (err, resDup) => {
                        if (err) {
                            conn.rollback(() => conn.release());
                            return callback({ message: "Erreur doublon" });
                        }

                        if (resDup.length > 0) {
                            conn.rollback(() => conn.release());
                            return callback({ message: "Déjà loué" });
                        }

                        // Copies
                        const sqlCopies = `
                            SELECT available_copies FROM films WHERE id = ?
                        `;
                        conn.query(sqlCopies, [filmId], (err, resCopies) => {
                            if (err) {
                                conn.rollback(() => conn.release());
                                return callback({ message: "Erreur copies" });
                            }

                            if (!resCopies.length || resCopies[0].available_copies <= 0) {
                                conn.rollback(() => conn.release());
                                return callback({ message: "Aucune copie disponible" });
                            }

                            // Décrément copies
                            const sqlUpdate = `
                                UPDATE films
                                SET available_copies = available_copies - 1
                                WHERE id = ?
                            `;
                            conn.query(sqlUpdate, [filmId], (err) => {
                                if (err) {
                                    conn.rollback(() => conn.release());
                                    return callback({ message: "Erreur update film" });
                                }

                                // Insérer location
                                const sqlInsert = `
                                    INSERT INTO rentals(user_id, film_id, rental_date)
                                    VALUES (?, ?, NOW())
                                `;
                                conn.query(sqlInsert, [userId, filmId], (err) => {
                                    if (err) {
                                        conn.rollback(() => conn.release());
                                        return callback({ message: "Erreur création location" });
                                    }

                                    // OK → COMMIT
                                    conn.commit(err => {
                                        conn.release();
                                        if (err) {
                                            return callback({ message: "Erreur commit" });
                                        }
                                        callback(null, { message: "Film loué avec succès" });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    // ======================================================
    // 2️⃣ RETOUR
    // ======================================================
    static RetournerFilm(userId, filmId, callback) {

        db.getConnection((err, conn) => {
            if (err) return callback({ message: "Erreur connexion DB" });

            conn.beginTransaction(err => {
                if (err) {
                    conn.release();
                    return callback({ message: "Erreur transaction" });
                }

                // Trouver location active
                const sqlFind = `
                    SELECT id 
                    FROM rentals
                    WHERE user_id = ? AND film_id = ? AND return_date IS NULL
                `;
                conn.query(sqlFind, [userId, filmId], (err, res) => {
                    if (err || !res.length) {
                        conn.rollback(() => conn.release());
                        return callback({ message: "Aucun film trouvé" });
                    }

                    const rentalId = res[0].id;

                    // Mettre return_date
                    conn.query(
                        "UPDATE rentals SET return_date = NOW() WHERE id = ?",
                        [rentalId],
                        err => {
                            if (err) {
                                conn.rollback(() => conn.release());
                                return callback({ message: "Erreur update rentals" });
                            }

                            // Rendre copie
                            conn.query(
                                "UPDATE films SET available_copies = available_copies + 1 WHERE id = ?",
                                [filmId],
                                err => {
                                    if (err) {
                                        conn.rollback(() => conn.release());
                                        return callback({ message: "Erreur update film" });
                                    }

                                    conn.commit(err => {
                                        conn.release();
                                        if (err) {
                                            return callback({ message: "Erreur commit" });
                                        }

                                        return callback(null, {
                                            message: "Retour effectué"
                                        });
                                    });
                                }
                            );
                        }
                    );
                });
            });
        });
    }

    // ======================================================
    // 3️⃣ FILMS LOUÉS
    // ======================================================
    static ObtenirFilmsLoues(userId, callback) {
        const sql = `
            SELECT 
                f.title, f.imgPath, 
                r.rental_date, r.return_date,
                CASE 
                    WHEN r.return_date IS NULL THEN 'En cours' 
                    ELSE 'Retourné' 
                END AS statut
            FROM rentals r
            JOIN films f ON f.id = r.film_id
            WHERE r.user_id = ?
            ORDER BY r.rental_date DESC
        `;
        db.query(sql, [userId], callback);
    }

    // ======================================================
    // 4️⃣ DÉJÀ LOUÉ ?
    // ======================================================
    static EstFilmDejaLoue(userId, filmId, callback) {
        const sql = `
            SELECT COUNT(*) AS rented
            FROM rentals
            WHERE user_id = ? AND film_id = ? AND return_date IS NULL
        `;
        db.query(sql, [userId, filmId], (err, res) => {
            if (err) return callback(err);
            callback(null, res[0].rented > 0);
        });
    }

    // ======================================================
    // 5️⃣ COMPTER LOCATIONS
    // ======================================================
    static CompterLocationsActives(userId, callback) {
        const sql = `
            SELECT COUNT(*) AS total
            FROM rentals
            WHERE user_id = ? AND return_date IS NULL
        `;
        db.query(sql, [userId], (err, res) => {
            if (err) return callback(err);
            callback(null, res[0].total);
        });
    }
}

module.exports = LocationDAO;
