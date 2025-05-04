const crypto = require('crypto');
const generateApiKey = () => {
    return 'smart-' + crypto.randomBytes(4).toString('hex') + '-' + crypto.randomBytes(4).toString('hex') + '-' + crypto.randomBytes(4).toString('hex') + '-' + crypto.randomBytes(4).toString('hex'); // 64-character key
}

module.exports = generateApiKey;