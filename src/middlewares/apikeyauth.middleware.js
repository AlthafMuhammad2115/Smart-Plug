const User = require('../models/user.model');
const crypto = require('crypto');

const verifyApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API key is missing' });
  }

  try {
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");
    const user = await User.findOne({ key: hashedKey });
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