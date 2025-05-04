const express = require('express');
const router = express.Router();
const { PlugControll } = require('../controllers/api.controller');
const { verifyApiKey }= require('../middlewares/userapiauth.middleware');

router.post('/control/plug', verifyApiKey, PlugControll);

module.exports = router;