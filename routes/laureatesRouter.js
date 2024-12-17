const express = require('express');
const laureatesController = require('../controllers/laureatesController');

const router = express.Router();

router.get('/', laureatesController.listLaureates);
router.get('/:id', laureatesController.getLaureateById);
router.get('/prizes/multiple-prizes', laureatesController.getMultiplePrizeWinners);
router.get('/prizes/categories', laureatesController.listCategories);
router.get('/prizes/number-laureates', laureatesController.getCategorieHigherNumberOfLaureates);
router.get('/prizes/number-laureates-by-year', laureatesController.getNumberOfLaureatesByYear);
router.get('/prizes/no-prizes', laureatesController.getNoPrizes);
router.get('/prizes/by-year', laureatesController.getLaureatesByYear);
router.delete('/laureate/:id', laureatesController.deleteLaureate);
router.put('/:id/motivation/:year/:category', laureatesController.updateMotivation);
router.get('/filter/:surname', laureatesController.getLaureateBySurname);
router.get('/', laureatesController.getPaginatedLaureates); // La route affiche tout les laureates malgré les paramètres dans l'url

module.exports = router;
