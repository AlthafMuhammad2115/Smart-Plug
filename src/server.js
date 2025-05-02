const http = require('http');
const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');
const { connectMqtt } = require('./config/mqttClient');
const { setupSocket } = require('./config/socket');

dotenv.config();

connectDB();
connectMqtt();

const server = http.createServer(app);
setupSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
