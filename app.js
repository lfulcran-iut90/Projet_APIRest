const express = require('express');
const laureatesRouter = require('./routes/laureatesRouter');

const app = express();

// Middleware JSON
app.use(express.json());

// Routes
app.use('/api/laureates', laureatesRouter);

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
