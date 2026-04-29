const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  organizer: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Tech', 'Sports', 'Cultural', 'Social', 'Academic'],
    default: 'Tech'
  },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
