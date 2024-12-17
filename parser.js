/**
 * @type {import('pg').Pool}
 */

const fs = require('fs');
const pool = require('./db/db');

// Fonction pour insérer les données
async function insertData() {
    const filePath = './prize.json'; // Chemin vers votre fichier JSON
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const client = await pool.connect(); // Obtenir une connexion du pool

    try {
        await client.query('BEGIN'); // Commencer une transaction

        for (const prize of jsonData.prizes) {
            // Insérer dans Categories
            const categoryRes = await client.query(
                `INSERT INTO Categories (name)
                 VALUES ($1)
                 ON CONFLICT (name) DO NOTHING
                 RETURNING id`,
                [prize.category]
            );
            const categoryId = categoryRes.rows[0]?.id || (
                await client.query('SELECT id FROM Categories WHERE name = $1', [prize.category])
            ).rows[0].id;

            // Insérer dans Prizes
            const prizeRes = await client.query(
                `INSERT INTO Prizes (year, category_id)
                 VALUES ($1, $2)
                 ON CONFLICT (year, category_id) DO NOTHING
                 RETURNING id`,
                [prize.year, categoryId]
            );
            const prizeId = prizeRes.rows[0]?.id || (
                await client.query('SELECT id FROM Prizes WHERE year = $1 AND category_id = $2', [prize.year, categoryId])
            ).rows[0].id;

            // Insérer les lauréats et les lier aux prix
            for (const laureate of prize.laureates || []) {
                // Insérer dans Laureates
                const laureateRes = await client.query(
                    `INSERT INTO Laureates (laureate_id, firstname, surname, motivation, share)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (laureate_id) DO NOTHING
                     RETURNING laureate_id`,
                    [
                        laureate.id,
                        laureate.firstname || null,
                        laureate.surname || null,
                        laureate.motivation || null,
                        laureate.share || null,
                    ]
                );
                const laureateId = laureateRes.rows[0]?.laureate_id || (
                    await client.query('SELECT laureate_id FROM Laureates WHERE laureate_id = $1', [laureate.id])
                ).rows[0].laureate_id;

                // Insérer dans Laureate_Prizes
                await client.query(
                    `INSERT INTO Laureate_Prizes (laureate_id, prize_id)
                     VALUES ($1, $2)
                     ON CONFLICT (laureate_id, prize_id) DO NOTHING`,
                    [laureateId, prizeId]
                );
            }
        }

        await client.query('COMMIT'); // Valider la transaction
        console.log('Insertion terminée avec succès.');
    } catch (error) {
        await client.query('ROLLBACK'); // Annuler en cas d'erreur
        console.error('Erreur lors de l\'insertion des données :', error);
    } finally {
        client.release(); // Relâcher la connexion au pool
    }
}

// Exécuter la fonction
insertData();
