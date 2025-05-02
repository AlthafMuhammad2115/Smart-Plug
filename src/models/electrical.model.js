const mongoose = require('mongoose');

const electricalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  deviceId:{
    type:String,
    required: true,
  },
  current:{
    type:Number,
    required:true
  },
  voltage:{
    type:Number,
    required:true
  },
  power:{
    type:Number,
    required:true
  },
  energy:{
    type:Number,
    required:true
  }
}, { timestamps: true });

module.exports = mongoose.model('electrical', electricalSchema);
