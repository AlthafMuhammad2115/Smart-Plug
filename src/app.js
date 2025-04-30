const express = require('express');
const app = express();

const authRoutes = require('./routes/auth.route');
const deviceRoutes = require('./routes/device.route');
const apiRoutes = require('./routes/api.route');

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/user/device', deviceRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
