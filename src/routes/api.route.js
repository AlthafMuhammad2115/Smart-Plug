const express = require('express');
const router = express.Router();
const { PlugControll } = require('../controllers/api.controller');
const { verifyApiKey }= require('../middlewares/apikeyauth.middleware');

router.post('/control/plug',verifyApiKey, PlugControll);

module.exports = router;