const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { addDevice, getDeviceDetail, setDeviceStatus, setConsumpion, getAllDevices, setIsOnline } = require('../controllers/device.controller');
const { verifyApiKey }= require('../middlewares/apikeyauth.middleware');

router.post('/add', protect, addDevice);
router.post('/setStatus', verifyApiKey, setDeviceStatus);
router.post('/devices/:id', protect, getDeviceDetail);
router.post('/setConsumption', verifyApiKey, setConsumpion);
router.post('/getAllDevices', protect, getAllDevices);
router.post('/setIsOnline', verifyApiKey, setIsOnline); 

module.exports = router;