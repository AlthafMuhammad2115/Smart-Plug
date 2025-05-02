const deviceModel = require("../models/devices.model");
const mqtt = require("mqtt");

exports.PlugControll = async (req, res) => {
    try {
        const { deviceId, mode, value } = req.body;
        const userId = req.user._id;
        const topicName = `${deviceId}/${mode}`;

        // Validate device ownership
        const deviceDetails = await deviceModel.findOne({ deviceId, userId });
        if (!deviceDetails) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // MQTT Client Setup
        const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD,
            port: parseInt(process.env.MQTT_PORT),
            clientId: `mqtt_${Math.random().toString(16).slice(2)}`,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
        });

        mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');

            mqttClient.publish(topicName, value.toString(), { qos: 1 }, async (err) => {
                mqttClient.end();

                if (err) {
                    console.error('Failed to publish message:', err);
                    return res.status(500).json({ message: 'Failed to publish message', error: err.message });
                }

                console.log('Message published:', value);

                try {
                    await deviceModel.updateOne(
                        { deviceId, userId },
                        { $set: { status: 1 } }
                    );
                    console.log('Device status updated to 1');
                } catch (updateErr) {
                    console.error('Failed to update device status:', updateErr);
                    return res.status(500).json({ message: 'Published but failed to update device status', error: updateErr.message });
                }

                return res.status(200).json({ message: 'Message published and device status updated', value });
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
