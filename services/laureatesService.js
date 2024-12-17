const pool = require('../db/db');

async function getAllLaureates() {
    const query = `SELECT laureate_id, firstname, surname FROM laureates`;
    const result = await pool.query(query);
    return result.rows;
}

async function getLaureateById(id) {
    const query = `
        SELECT l.firstname,
               l.surname,
               p.year,
               c.name AS category,
               l.motivation
        FROM Laureates l
                 JOIN Laureate_Prizes lp ON l.laureate_id = lp.laureate_id
                 JOIN Prizes p ON lp.prize_id = p.id
                 JOIN Categories c ON p.category_id = c.id
        WHERE l.laureate_id = $1
        ORDER BY p.year ASC;
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
}

async function getMultiplePrizeWinners() {
    const query = `
        SELECT
            l.firstname,
            l.surname,
            COUNT(lp.prize_id) AS number_of_prizes
        FROM
            Laureates l
        JOIN
            Laureate_Prizes lp ON l.laureate_id = lp.laureate_id
        GROUP BY
            l.firstname, l.surname
        HAVING
            COUNT(lp.prize_id) > 1;
    `;
    try {
        const result = await pool.query(query);
        return result.rows; // Retourne uniquement les résultats
    } catch (error) {
        console.error('Erreur dans le service :', error);
        throw error; // Relance l'erreur pour que le contrôleur puisse la gérer
    }
}

async function getAllCategories() {
    const query = `SELECT name FROM categories`;
    const result = await pool.query(query);
    return result.rows;
}

async function getCategorieHigherNumberOfLaureates() {
    const query = `
        SELECT
            c.name AS category_name,
            COUNT(DISTINCT lp.laureate_id) AS number_of_laureates
        FROM
            Categories c
        JOIN Prizes p ON c.id = p.category_id
        JOIN Laureate_Prizes lp ON p.id = lp.prize_id
        GROUP BY
            c.name
        ORDER BY
            number_of_laureates DESC
            LIMIT 1;
    `;
    const result = await pool.query(query);
    return result.rows;
}

async function getNumberOfLaureatesByYear(){
    const query = `
        SELECT
            p.year,
            COUNT(DISTINCT lp.laureate_id) AS number_of_laureates
        FROM
            Prizes p
        LEFT JOIN Laureate_Prizes lp ON p.id = lp.prize_id
        GROUP BY
            p.year
        ORDER BY
            p.year DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
}

async function getNoPrizes(){
    const query = `
        SELECT
            p.year,
            COUNT(DISTINCT lp.laureate_id) AS number_of_laureates
        FROM
            Prizes p
        LEFT JOIN Laureate_Prizes lp ON p.id = lp.prize_id
        GROUP BY
            p.year
        HAVING
            COUNT(DISTINCT lp.laureate_id) = 0
        ORDER BY
            p.year DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
}

async function getLaureatesByYear(sortOrder){
    const sortColumn = "number_of_laureates"; // Tri sur le nombre de lauréats
    const sortDirection = sortOrder === "asc_laureates" ? "ASC" : "DESC";

    const query = `
        SELECT
            p.year,
            COUNT(DISTINCT lp.laureate_id) AS number_of_laureates
        FROM
            Prizes p
        JOIN Laureate_Prizes lp ON p.id = lp.prize_id
        GROUP BY
            p.year
        ORDER BY
            ${sortColumn} ${sortDirection};
    `;
    const result = await pool.query(query);
    return result.rows;
}

async function deleteLaureateById(laureateId) {
    // Supprime d'abord les relations dans Laureate_Prizes
    const deleteFromLaureatePrizesQuery = `
        DELETE FROM Laureate_Prizes WHERE laureate_id = $1;
    `;
    await pool.query(deleteFromLaureatePrizesQuery, [laureateId]);

    // Supprime ensuite le lauréat lui-même
    const deleteLaureateQuery = `
        DELETE FROM Laureates WHERE laureate_id = $1;
    `;
    const result = await pool.query(deleteLaureateQuery, [laureateId]);

    return result; // Contient le `rowCount` pour vérifier si la suppression a eu lieu
}

async function updateLaureateMotivation(motivation, laureateId, year, category) {
    const query = `
        UPDATE Laureates l
        SET
            motivation = $1
            FROM 
            Laureate_Prizes lp
        JOIN 
            Prizes p ON lp.prize_id = p.id
            JOIN
            Categories c ON p.category_id = c.id
        WHERE
            l.laureate_id = lp.laureate_id
          AND l.laureate_id = $2
          AND p.year = $3
          AND c.name = $4;
    `;

    const values = [motivation, laureateId, year, category];
    return pool.query(query, values);
}

async function getLaureateBySurname(surname) {
    const query = `
        SELECT
            l.firstname,
            l.surname,
            p.year,
            c.name AS category,
            COUNT(DISTINCT lp.prize_id) AS number_of_prizes
        FROM
            Laureates l
                LEFT JOIN
            Laureate_Prizes lp ON l.laureate_id = lp.laureate_id
                LEFT JOIN
            Prizes p ON lp.prize_id = p.id
                LEFT JOIN
            Categories c ON p.category_id = c.id
        WHERE
            l.surname LIKE $1
        GROUP BY
            l.laureate_id, p.year, c.name
        ORDER BY
            number_of_prizes DESC, p.year ASC;
    `;

    const values = [`%${surname}%`]; // Ajout des caractères génériques pour une correspondance partielle
    const result = await pool.query(query, values);
    return result.rows;
}

async function getPaginatedLaureates(limit, offset) {
    const query = `
        SELECT l.laureate_id, l.firstname, l.surname, l.motivation
        FROM Laureates l
        ORDER BY l.laureate_id
        LIMIT $1 OFFSET $2;
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
}

async function getTotalLaureatesCount() {
    const query = `SELECT COUNT(*) AS total FROM Laureates;`;
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
}


module.exports = {
    getAllLaureates,
    getLaureateById,
    getMultiplePrizeWinners,
    getAllCategories,
    getCategorieHigherNumberOfLaureates,
    getNumberOfLaureatesByYear,
    getNoPrizes,
    getLaureatesByYear,
    deleteLaureateById,
    updateLaureateMotivation,
    getLaureateBySurname,
    getPaginatedLaureates,
    getTotalLaureatesCount,
};
