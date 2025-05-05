const User = require('../models/user.model');
const crypto = require('crypto');

const verifyDeviceApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API key is missing' });
  }

  try {
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");
    const device = await Device.findOne({ key: hashedKey });
    if (!device) {
      return res.status(401).json({ message: 'Invalid API key' });
    }
    const user = await User.findById(device.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error in device Auth', error: error });
  }
}

module.exports = { verifyDeviceApiKey };