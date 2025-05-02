const Device = require('../models/devices.model');
const consumptionModel = require('../models/consumption.model');
const { getMqttClient } = require('../config/mqttClient');
const getAllDevicesByUser = require('../services/getAllDevicesByUser');

exports.addDevice = async (req, res) => {
    const { deviceId } = req.body;
    const userId = req.user._id;

    try {
        const mqttClient = getMqttClient();
        if (!mqttClient) {
            console.error('Failed to connect MQTT client');
            return res.status(500).json({ message: 'Failed to connect to MQTT client' });
        }
        const topic = `${deviceId}/register`;
        const message = JSON.stringify({ userId });

        mqttClient.publish(topic, message, { qos: 1 }, (err) => {
            if (err) {
                console.error('Failed to publish message:', err);
                return res.status(500).json({ message: 'Failed to register device', error: err.message });
            }
            console.log('Message sent:', message);
        });

        mqttClient.subscribe(`${deviceId}/register/response`, (err) => {
            if (err) {
                console.error('Failed to subscribe to topic:', err);
                return res.status(500).json({ message: 'Failed to subscribe to topic', error: err.message });
            }
            console.log(`Subscribed to topic: ${deviceId}/register/response`);
        });

        mqttClient.on('message', async (topic, message) => {
            console.log('Received message:', topic, message.toString());
            if (topic === `${deviceId}/register/response`) {
                console.log('Device available for register:', message.toString());
                const device = await Device.create({ deviceId, userId, status: 0 });
                if (!device) {
                    console.error('Failed to create device:', response);
                    mqttClient.end();
                    return res.status(500).json({ message: 'Failed to create device', error: response.error });
                }
                console.log('Device registered successfully:', device);
                return res.status(200).json({ message: 'Device registered successfully' });
            } else {
                console.error('Device registration failed:', message.toString());
                return res.status(500).json({ message: 'Device registration failed', error: response.error });
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add device', error: err.message });
    }
};

exports.getDeviceDetail = async (req, res) => {
    const deviceId = req.params.id;
    const { userId } = req.body;

    try {
        const device = await Device.findOne({ userId, deviceId });

        if (!device) return res.status(404).json({ message: 'Device Not Found' });

        res.status(200).json({ data: device, message: 'Device data Sent' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to Fetch Device Status', error: err.message });
    }
}

exports.getAllDevices = async (req, res) => {
    const userId = req.user._id;

    try {
        const devices = await getAllDevicesByUser(userId);
        if (!devices) return res.status(404).json({ message: 'Devices Not Found' });
        devices.forEach(device => {
            mqttClient.subscribe(`${device.deviceId}/device/isOnline`, (err) => {
                if (err) {
                    console.error('Failed to subscribe to topic:', err);
                    return res.status(500).json({ message: `Failed to subscribe to topic ${topic}`, error: err.message });
                }
                console.log(`Subscribed to topic: ${device.deviceId}/device/isOnline`);
            });
        });

        mqttClient.on('message', async (topic, message) => {
            console.log('Received message:', topic, message.toString());
            const deviceId = topic.split('/')[0];
            const device = await Device.findOne({ deviceId });
            if (!device) {
                console.error('Device not found:', deviceId);
                return;
            }
            const status = message.toString() === 'true' ? true : false;
            device.isOnline = status;
            await device.save();
            console.log(`Device ${deviceId} is online: ${status}`);
        });
        
        res.status(200).json({ data: devices, message: 'Devices data Sent' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to Fetch Devices', error: err.message });
    }
}

exports.setDeviceStatus = async (req, res) => {
    const { deviceId, status } = req.body;

    try {
        const device = await Device.findOne({ deviceId });

        if (!device) {
            return res.status(404).json({ message: 'Device Not Found' });
        }

        device.status = status;
        await device.save();

        return res.status(200).json({ message: 'Device status updated', device });
    } catch (error) {
        console.error('Error updating device status:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.setConsumpion = async (req, res) => {
    const { deviceId, voltage, current, energy, power } = req.body;

    try {
        const device = await Device.findOne({ deviceId });
        if (!device) {
            return res.status(404).json({ message: 'Device Not Found' });
        }

        consumptionModel.create({ userId, voltage, current, deviceId, energy, power });

        device.totalConsumption += energy;
        device.save();
        return res.status(200).json({ message: 'Device consumption updated', deviceId });
    } catch (error) {
        console.error('Error updating device consumption:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.setIsOnline = async (req, res) => {
    const { isOnline, deviceId } = req.body;
    try {
        const device = await Device.findOne({ deviceId: deviceId.toString(), userId: req.user._id.toString() });
        if (!device) {
            return res.status(404).json({ message: 'Device Not Found' });
        }
        device.isOnline = isOnline;
        await device.save();
        return res.status(200).json({ message: 'Device status updated', device });
    } catch (error) {
        console.error('Error updating device status:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}