const mqtt = require("mqtt");

let mqttClient;
const connectMqtt = () => {
    mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        port: parseInt(process.env.MQTT_PORT),
        clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    });

    mqttClient.on("connect", async () => {
        console.log("Connected to MQTT Broker");
    });

    mqttClient.on("error", (err) => {
        console.log("MQTT connection error: ", err);
    });

    return mqttClient;
};


module.exports = {
    connectMqtt,
    getMqttClient: () => mqttClient,
};
