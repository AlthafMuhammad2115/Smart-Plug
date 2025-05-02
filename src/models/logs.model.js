const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  deviceId:{
    type:String,
    required: true,
  },
  status:{
    type:Number,
    required:true
  }
}, { timestamps: true });

module.exports = mongoose.model('Logs', logsSchema);
