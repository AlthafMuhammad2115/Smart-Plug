const deviceModel = require("../models/devices.model");
const mqtt = require("mqtt");

exports.PlugControll = async (req, res) => {
    try {
        const { deviceId, mode, value } = req.body;
        const userId = req.user._id.toString();
        const topic = `${deviceId}/${mode}`
        
        // Validate device ownership
        const deviceDetails = await deviceModel.findOne({ deviceId: deviceId.toString(), userId: userId });
        
        if (!deviceDetails) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // MQTT client setup
        const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
            clientId: `mqtt_${Math.random().toString(16).slice(2)}`,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
        });
        mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');

            mqttClient.publish(topic, value.toString(), { qos: 1 }, (err) => {
                mqttClient.end(); // Always close connection after publish

                if (err) {
                    console.error('Failed to publish message:', err);
                    return res.status(500).json({ message: 'Failed to publish message', error: err.message });
                }

                console.log('Message sent:', value);
                return res.status(200).json({ message: 'Message published successfully' });
            });
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT connection error:', err);
            mqttClient.end();
            return res.status(500).json({ message: 'MQTT connection error', error: err.message });
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
