const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Club = require('./models/Club');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const clubsToEnsure = [
  "Booking Club",
  "Mechanical Club",
  "Civil Engineering Club",
  "Idea Hub",
  "Career Development Club",
  "Law Association Club",
  "Truth Culture Club"
];

const seedClubs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const clubName of clubsToEnsure) {
      const existing = await Club.findOne({ name: clubName });
      if (!existing) {
        await Club.create({
          name: clubName,
          category: 'Academic', // Default category
          description: `Official ${clubName}`,
          founded: new Date().getFullYear().toString(),
          status: 'active'
        });
        console.log(`Created club: ${clubName}`);
      } else {
        console.log(`Club already exists: ${clubName}`);
      }
    }
    
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding clubs:', error);
    process.exit(1);
  }
};

seedClubs();
