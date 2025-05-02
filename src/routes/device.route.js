const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { addDevice,getDeviceStatus,setDeviceStatus } = require('../controllers/device.controller');

router.post('/add', protect, addDevice);
router.post('/setStatus', setDeviceStatus);
router.post('/getStatus',protect, getDeviceStatus);

module.exports = router;