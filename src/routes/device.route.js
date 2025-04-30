const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { addDevice } = require('../controllers/auth.controller');

router.post('/add', protect, addDevice);

module.exports = router;