const express = require('express');
const router = express.Router();    

router.post('/add', (req, res) => {
  // Logic to add a device
  res.status(201).json({ message: 'Device added successfully' });
});

module.exports = router;


