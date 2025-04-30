const express = require('express');
const app = express();

const authRoutes = require('./routes/auth.route');

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
