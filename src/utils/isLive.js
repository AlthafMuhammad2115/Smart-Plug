const { getMqttClient } = require('../config/mqttClient');
const isLive = async () => {
    const mqttClient = getMqttClient();
    if (!mqttClient) {
        console.error('Failed to connect MQTT client');
        return res.status(500).json({ message: 'Failed to connect to MQTT client' });
    }

    mqttClient.on('message', async (topic, message) => {
        const subTopic = topic.split('/').slice(1).join('/');
        if(subTopic === 'device/isOnline') {
            const deviceId = topic.split('/')[0];
            const device = await Device.findOne({ deviceId });
            if (!device) {
                console.error('isLive: Device not found:', deviceId);
            }
            const status = message.toString() === 'true' ? true : false;
            device.isOnline = status;
            await device.save();
            console.log(`Device ${deviceId} is online: ${status}`);
        }
    });
}

