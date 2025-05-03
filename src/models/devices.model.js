const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  status:{
    type:Number,
    required:true,
    default:0
  },
  totalConsumption:{
    type:Number,
    required:true,
    default:0
  },
  deviceName:{
    type:String,
    required:true
  },
  isOnline:{
    type:Boolean,
    required:true,
    default:true
  }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
