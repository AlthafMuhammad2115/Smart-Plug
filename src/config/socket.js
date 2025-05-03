const { Server } = require('socket.io');
const { getMqttClient } = require('./mqttClient.js'); // Adjust the path as necessary
let io;

const setupSocket = (server) => {
    const mqttClient = getMqttClient();
    if (!mqttClient) {
        console.error('Failed to connect MQTT client');
        return;
    }
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST'],
        },
    });

    console.log("socket started");
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on('ping', () => {
            console.log('Received ping');
            socket.emit('pong');
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
        socket.on("subscribeToDevice", (deviceId) => {

            const metricsTopic = `device/${deviceId}/metrics`
            console.log(`Subscribing to device: ${deviceId}`);
            mqttClient.subscribe(metricsTopic, { qos: 1 }, (err) => {
                if (err) {
                    console.error('Failed to subscribe to topic:', err);
                }
                console.log(`Subscribed to topic: ${metricsTopic}`);
            });
            mqttClient.on("message", (topic, message) => {
                console.log(`Received message on topic: ${topic}`);
                console.log(`Message: ${message.toString()}`);
                if (topic === metricsTopic) {
                    const data = JSON.parse(message.toString());
                    console.log(data);
                    socket.emit("deviceMetrics", data);
                }
            });
        });
    });
}

function getSocketIO() {
    return io;
}

module.exports = { setupSocket, getSocketIO };