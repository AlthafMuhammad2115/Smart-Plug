const User = require('../models/user.model');
const Device = require('../models/devices.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

function generateApiKey() {
  return 'smart-' + crypto.randomBytes(4).toString('hex') + '-' + crypto.randomBytes(4).toString('hex') + '-' + crypto.randomBytes(4).toString('hex') + '-' + crypto.randomBytes(4).toString('hex'); // 64-character key
}

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = generateApiKey();
    const hashedKey = await bcrypt.hash(apiKey, 10);
    const newUser = new User({ username, email, password: hashedPassword, key: hashedKey });
    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email, key: apiKey }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.addDevice = async (req, res) => {
  // first send a register message to deviceId/register topic using mqtt, if success then add device to user
  const mqtt = require('mqtt');
  const { deviceId } = req.body;
  const userId = req.user._id;
  try{
    const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
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
        mqttClient.end();
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
      if (topic === `${deviceId}/register/response`) {
        const response = JSON.parse(message.toString());
        if (response.status === 'success') {
          console.log('Device available for register:', response);
          const device = await Device.create({ deviceId, userId });
          if (!device) {
            console.error('Failed to create device:', response);
            mqttClient.end();
            return res.status(500).json({ message: 'Failed to create device', error: response.error });
          }
          console.log('Device registered successfully:', device);
          mqttClient.end();
          return res.status(200).json({ message: 'Device registered successfully' });
        } else {
          console.error('Device registration failed:', response);
          mqttClient.end();
          return res.status(500).json({ message: 'Device registration failed', error: response.error });
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add device', error: err.message });
  }
};