const laureatesService = require('../services/laureatesService');

async function listLaureates(req, res) {
    try {
        const laureates = await laureatesService.getAllLaureates();
        res.status(200).json(laureates);
    } catch (error) {
        console.error('Erreur lors de la récupération des lauréats :', error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}

async function getLaureateById(req, res) {
    const { id } = req.params;
    try {
        const laureate = await laureatesService.getLaureateById(id);
        if (laureate.length === 0) {
            return res.status(404).json({ error: 'Lauréat non trouvé' });
        }
        res.status(200).json(laureate);
    } catch (error) {
        console.error('Erreur lors de la récupération du lauréat :', error); // Log détaillé
        res.status(500).json({ error: error.message }); // Renvoyer l'erreur dans la réponse
    }
}

async function getMultiplePrizeWinners(req, res) {
    try {
        const winners = await laureatesService.getMultiplePrizeWinners();
        res.status(200).json(winners);
    } catch (error) {
        console.error('Erreur lors de la récupération des gagnants multiples :', error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}

async function listCategories(req, res) {
    try {
        const categories = await laureatesService.getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}

async function getCategorieHigherNumberOfLaureates(req, res){
    try {
        const categorie = await laureatesService.getCategorieHigherNumberOfLaureates();
        res.status(200).json(categorie);
    } catch (error){
        console.error('Erreur lors de la récupération du nombre de lauréates de la catégorie :', error);
        res.status(500).json({ error: 'Une erreur est survenue.'});
    }
}

async function getNumberOfLaureatesByYear(req, res){
    try {
        const laureates = await laureatesService.getNumberOfLaureatesByYear();
        res.status(200).json(laureates);
    } catch (error){
        console.error('Erreur lors de la récupération du nombre de lauréates par année :', error);
        res.status(500).json({ error: 'Une erreur est survenue.'});
    }
}

async function getNoPrizes(req, res){
    try {
        const noprizes = await laureatesService.getNoPrizes();
        res.status(200).json(noprizes);
    } catch (error){
        console.error('Erreur lors de la récupération du nombre de lauréates par année :', error);
        res.status(500).json({ error: 'Une erreur est survenue.'});
    }
}

async function getLaureatesByYear(req, res){
    try {
        const sortOrder = req.query.sort;
        const validSortOrders = ['asc_laureates', 'desc_laureates'];

        // Vérifie si le paramètre est valide
        if (!validSortOrders.includes(sortOrder)) {
            return res.status(400).json({ error: 'Invalid sort order. Use asc_laureates or desc_laureates.' });
        }

        const results = await laureatesService.getLaureatesByYear(sortOrder);
        res.status(200).json(results);
    } catch (error){
        console.error('Erreur lors de la récupération du nombre de lauréates par année :', error);
        res.status(500).json({ error: 'Une erreur est survenue.'});
    }
}

async function deleteLaureate(req, res) {
    try {
        const laureateId = parseInt(req.params.id, 10);

        if (isNaN(laureateId)) {
            return res.status(400).json({ error: 'Invalid laureate ID.' });
        }

        const deletionResult = await laureatesService.deleteLaureateById(laureateId);

        if (deletionResult.rowCount === 0) {
            return res.status(404).json({ error: 'Laureate not found.' });
        }

        res.status(200).json({ message: `Laureate with ID ${laureateId} deleted successfully.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateMotivation(req, res) {
    try {
        const { id, year, category } = req.params;
        const { motivation } = req.body;

        if (!motivation) {
            return res.status(400).json({ error: 'Motivation is required.' });
        }

        const laureateId = parseInt(id, 10);

        if (isNaN(laureateId)) {
            return res.status(400).json({ error: 'Invalid laureate ID.' });
        }

        const result = await laureatesService.updateLaureateMotivation(
            motivation,
            laureateId,
            year,
            category
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No matching laureate found.' });
        }

        res.status(200).json({ message: 'Motivation updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getLaureateBySurname(req, res) {
    const surname = req.params.surname; // On récupère le paramètre surname
    if (!surname) {
        return res.status(400).json({ error: 'Veuillez fournir un nom de famille à rechercher.' });
    }

    try {
        const laureates = await laureatesService.getLaureateBySurname(surname); // Appel de la fonction qui effectue le filtrage
        if (laureates.length === 0) {
            return res.status(404).json({ message: 'Aucun lauréat trouvé pour ce nom de famille.' });
        }
        res.status(200).json(laureates); // Envoi des résultats
    } catch (error) {
        console.error('Erreur lors du filtrage des lauréats :', error);
        res.status(500).json({ error: 'Erreur serveur lors du filtrage des lauréats.' });
    }
}

async function getPaginatedLaureates(req, res) {
    const page = parseInt(req.query.page) || 1; // Page par défaut : 1
    const limit = parseInt(req.query.limit) || 10; // Limite par défaut : 10

    if (page <= 0 || limit <= 0) {
        return res.status(400).json({ error: 'Les paramètres page et limit doivent être des entiers positifs.' });
    }

    const offset = (page - 1) * limit; // Calcul de l'offset

    try {
        const { rows: laureates } = await laureatesService.getPaginatedLaureates(limit, offset);
        const total = await laureatesService.getTotalLaureatesCount();
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            currentPage: page,
            totalPages,
            totalLaureates: total,
            results: laureates,
        });
        console.log('Page:', page, 'Limit:', limit, 'Offset:', offset);
    } catch (error) {
        console.error('Erreur lors de la pagination des lauréats :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la pagination des lauréats.' });
    }
}



module.exports = {
    listLaureates,
    getLaureateById,
    getMultiplePrizeWinners,
    listCategories,
    getCategorieHigherNumberOfLaureates,
    getNumberOfLaureatesByYear,
    getNoPrizes,
    getLaureatesByYear,
    deleteLaureate,
    updateMotivation,
    getLaureateBySurname,
    getPaginatedLaureates,
};