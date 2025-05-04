const Device = require('../models/devices.model');
const consumptionModel = require('../models/consumption.model');
const { getMqttClient } = require('../config/mqttClient');
const getAllDevicesByUser = require('../services/getAllDevicesByUser');
const generateApiKey = require('../utils/generateApiKey');
const crypto = require('crypto');

exports.addDevice = async (req, res) => {
    const { deviceId, deviceName } = req.body;
    const userId = req.user._id;
    const apiKey = generateApiKey();
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");
    try {
        const mqttClient = getMqttClient();
        if (!mqttClient) {
            console.error('Failed to connect MQTT client');
            return res.status(500).json({ message: 'Failed to connect to MQTT client' });
        }

        const registerTopic = `${deviceId}/register`;
        const responseTopic = `${deviceId}/register/response`;
        const message = apiKey;

        const waitForResponse = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                mqttClient.removeListener('message', onMessage);
                reject(new Error('MQTT response timeout'));
            }, 10000);

            const onMessage = async (topic, payload) => {
                if (topic === responseTopic) {
                    clearTimeout(timeout);
                    mqttClient.removeListener('message', onMessage);
                    resolve(payload.toString());
                }
            };

            mqttClient.on('message', onMessage);
        });

        await new Promise((resolve, reject) => {
            mqttClient.subscribe(responseTopic, { qos: 1 }, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        mqttClient.publish(registerTopic, message, { qos: 1 }, (err) => {
            if (err) {
                console.error('Failed to publish message:', err);
                return res.status(500).json({ message: 'Failed to register device', error: err.message });
            }
            console.log('Message sent:', message);
        });

        const mqttResponse = await waitForResponse;
        console.log('Device available for register:', mqttResponse);

        const device = await Device.create({ deviceId, userId, deviceName, key: hashedKey });
        return res.status(200).json({ message: 'Device registered successfully', data: device });

    } catch (err) {
        res.status(500).json({ message: 'Failed to add device', error: err.message });
    }
};

exports.getDeviceDetail = async (req, res) => {
    const deviceId = req.params.id;
    const userId = req.user._id;

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
    const mqttClient = getMqttClient();
    if (!mqttClient) {
        console.error('Failed to connect MQTT client');
        return res.status(500).json({ message: 'Failed to connect to MQTT client' });
    }
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
            const subTopic = topic.split('/')[2];
            if (subTopic === `isOnline`) {
                const deviceId = topic.split('/')[0];
                console.log('Device ID:', deviceId);
                const device = await Device.findOne({ deviceId });
                if (!device) {
                    console.error('Device not found:', deviceId);
                    res.status(500).json({ message: 'No device Found', error: err.message });
                }
                const status = message.toString() === 'true' ? true : false;
                device.isOnline = status;
                await device.save();
                // devices.find(d => d.deviceId === deviceId).isOnline = status;
                console.log(`Device ${deviceId} is online: ${status}`);
            }
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