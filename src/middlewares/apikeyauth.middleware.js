const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const verifyApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API key is missing' });
  }

  try {
    const hashedKey = await bcrypt.hash(apiKey, 10)
    const user = await User.findOne({ hashedKey });

    if (!user) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { verifyApiKey };