const DeviceModel = require('../models/devices.model');

const getAllDevicesByUser = async (userId) => {
    try {
        const devices = await DeviceModel.find({ userId });
        if (!devices) {
            return null;
        }
        return devices;
    } catch (err) {
        console.error('Error fetching devices:', err);
        return null;
    }
}

module.exports = getAllDevicesByUser;