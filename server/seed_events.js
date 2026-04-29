const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config({ path: './.env' });

async function seedEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-attendance');
    console.log('Connected to DB...');

    const dummyEvents = [
      {
        name: 'Global Tech Symposium 2024',
        date: 'May 24-26',
        organizer: 'IEEE Student Chapter',
        category: 'Tech',
        description: 'A 3-day symposium featuring talks from industry leaders.'
      },
      {
        name: 'Inter-Department Football Trophy',
        date: 'June 02',
        organizer: 'Sports Committee',
        category: 'Sports',
        description: 'Annual football tournament for all departments.'
      },
      {
        name: 'Sparks Cultural Fest',
        date: 'June 15-18',
        organizer: 'Fine Arts Club',
        category: 'Cultural',
        description: 'University-wide cultural festival with music and dance.'
      }
    ];

    await Event.deleteMany({}); // Clear existing to avoid duplicates during visualization
    await Event.insertMany(dummyEvents);
    console.log('3 Dummy Events Seeded successfully! ✅');
    process.exit();
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedEvents();
