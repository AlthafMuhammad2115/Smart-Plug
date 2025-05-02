const { Server } = require('socket.io');

let io;

const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
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
            mqttClient.on("message", (topic, message) => {
                if (topic === `device/${deviceId}/metrics`) {
                    const data = JSON.parse(message.toString());
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