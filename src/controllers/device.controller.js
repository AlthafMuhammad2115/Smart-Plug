const Device = require('../models/devices.model');

exports.addDevice = async (req, res) => {
    // first send a register message to deviceId/register topic using mqtt, if success then add device to user
    const mqtt = require('mqtt');
    const { deviceId } = req.body;
    const userId = req.user._id;
    try {
        const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD,
            port: parseInt(process.env.MQTT_PORT),
            clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
        });
        const topic = `${deviceId}/register`;
        const message = JSON.stringify({ userId });
        mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');
            mqttClient.publish(topic, message, { qos: 1 }, (err) => {
                if (err) {
                    console.error('Failed to publish message:', err);
                    return res.status(500).json({ message: 'Failed to register device', error: err.message });
                }
                console.log('Message sent:', message);
            });
        });
        // check if there is a response from the device in deviceID/register/response topic, if success then add device to user
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
                const device = await Device.create({ deviceId, userId ,status:0});
                if (!device) {
                    console.error('Failed to create device:', response);
                    mqttClient.end();
                    return res.status(500).json({ message: 'Failed to create device', error: response.error });
                }
                console.log('Device registered successfully:', device);
                mqttClient.end();
                return res.status(200).json({ message: 'Device registered successfully' });
            } else {
                console.error('Device registration failed:', message.toString());
                mqttClient.end();
                return res.status(500).json({ message: 'Device registration failed', error: response.error });
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add device', error: err.message });
    }
};

exports.getDeviceStatus =async(req,res)=>{
    const {userId,deviceId}=req.body;

    try{
        const device=await Device.findOne({userId,deviceId});

        if(!device)return res.status(404).json({message:'Device Not Found'});
    
        res.status(200).json({status:device.status,message:'Device Status Sent'})
    }catch(err){
        res.status(500).json({ message: 'Failed to Fetch Device Status', error: err.message });
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
