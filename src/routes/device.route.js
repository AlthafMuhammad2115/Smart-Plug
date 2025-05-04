const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { addDevice, getDeviceDetail, setDeviceStatus, setConsumpion, getAllDevices, setIsOnline } = require('../controllers/device.controller');
const { verifyApiKey }= require('../middlewares/userapiauth.middleware');
const { verifyDeviceApiKey }= require('../middlewares/deviceapiauth.middleware');

router.post('/add', protect, addDevice);
router.post('/setStatus', verifyDeviceApiKey, setDeviceStatus);
router.get('/devices/:id', protect, getDeviceDetail);
router.post('/setConsumption', verifyDeviceApiKey, setConsumpion);
router.get('/getAllDevices', protect, getAllDevices);
router.post('/setIsOnline', verifyDeviceApiKey, setIsOnline); 

module.exports = router;