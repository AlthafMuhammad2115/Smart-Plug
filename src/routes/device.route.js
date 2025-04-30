const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/apikeyauth.middleware');
const { addDevice } = require('../controllers/device.controller');

// router.post('/add', protect, addDevice);

module.exports = router;