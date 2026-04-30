const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function seedAcademicAffairs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully!');

        const username = 'dbu10101021';
        const password = 'Admin123#';

        // Check if user already exists
        let user = await User.findOne({ username });

        if (user) {
            console.log('User already exists. Updating role and password...');
            user.password = password;
            user.role = 'academic_affairs';
            user.isAdmin = true;
            user.department = 'Academic Affairs';
            user.year = '1st Year';
            await user.save();
            console.log('User updated successfully!');
        } else {
            console.log('Creating new Academic Affairs admin user...');
            user = await User.create({
                name: 'Academic Affairs Admin',
                username,
                password,
                email: 'academic.affairs@dbu.edu.et',
                department: 'Academic Affairs',
                year: '1st Year',
                isAdmin: true,
                role: 'academic_affairs'
            });
            console.log('User created successfully!');
        }

        console.log('\n--- User Details ---');
        console.log(`Username: ${user.username}`);
        console.log(`Password: ${password} (Plain text for verification)`);
        console.log(`Role: ${user.role}`);
        console.log(`isAdmin: ${user.isAdmin}`);
        console.log('-------------------\n');

        await mongoose.disconnect();
        console.log('Database disconnected.');
    } catch (error) {
        console.error('Error seeding user:', error.message);
        process.exit(1);
    }
}

seedAcademicAffairs();
