const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully!\n');

        const User = require('./models/User');

        // Get all users
        const users = await User.find({}).select('username name isActive isAdmin role loginAttempts isLocked');

        console.log('=== Users in Database ===');
        if (users.length === 0) {
            console.log('No users found in database!');
            console.log('\nYou need to register a new user first.');
        } else {
            users.forEach(u => {
                console.log(`Username: ${u.username}`);
                console.log(`  Name: ${u.name}`);
                console.log(`  Active: ${u.isActive}`);
                console.log(`  Admin: ${u.isAdmin}`);
                console.log(`  Role: ${u.role}`);
                console.log(`  Locked: ${u.isLocked}`);
                console.log(`  Login Attempts: ${u.loginAttempts}`);
                console.log('---');
            });
        }

        await mongoose.disconnect();
        console.log('\nDatabase disconnected.');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
