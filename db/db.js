/**
 * @type {import('pg').Pool}
 */
const { Pool } = require('pg');

// Configuration de la base de données PostgreSQL
const pool = new Pool({
    user: 'postgres',        // Exemple : 'postgres'
    host: 'localhost',               // Exemple : '127.0.0.1'
    database: 'nobelprize.sql', // Exemple : 'nobel_prizes'
    password: 'lucasmdp',  // Exemple : 'motdepasse123'
    port: 5432
});

module.exports = pool;