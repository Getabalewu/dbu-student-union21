const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Club = require('./models/Club');
const User = require('./models/User');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedMockStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const clubs = await Club.find();
    console.log(`Found ${clubs.length} clubs.`);

    let studentCounter = 12345678; // Starting 8-digit number

    for (const club of clubs) {
      console.log(`Processing club: ${club.name}`);
      
      // Clear existing mock members to ensure clean state
      club.members = [];
      club.leadership = club.leadership || {};
      
      for (let i = 0; i < 5; i++) {
        const studentId = `dbu${studentCounter}`;
        const existingUser = await User.findOne({ username: studentId });
        
        let user;
        const isPresident = i === 0; // First student is the representative (president)
        const role = isPresident ? 'president' : 'student';

        if (!existingUser) {
          user = await User.create({
            name: `Mock Student ${studentCounter}`,
            username: studentId,
            password: 'Password@2025', 
            department: 'Computer Science',
            year: '1st Year',
            role: role,
            isActive: true,
            studentId: studentId,
            ...(isPresident ? { clubId: club._id } : {})
          });
        } else {
          user = existingUser;
          if (isPresident) {
             user.role = 'president';
             user.clubId = club._id;
             await user.save();
          } else {
             user.role = 'student';
             await user.save();
          }
        }

        club.members.push({
          user: user._id,
          fullName: user.name,
          department: user.department,
          year: user.year,
          role: isPresident ? 'president' : 'member',
          status: 'approved',
          joinedAt: new Date(),
          approvedAt: new Date()
        });
        
        if (isPresident) {
          club.leadership.president = user._id;
        }

        studentCounter++;
      }
      
      await club.save();
      console.log(`Added 5 mock members to ${club.name} and set representative.`);
    }

    console.log('Seeding mock students completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding mock students:', error);
    process.exit(1);
  }
};

seedMockStudents();
