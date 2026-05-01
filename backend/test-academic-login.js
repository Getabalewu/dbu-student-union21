const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testAcademicLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected!');

        const User = require('./models/User');
        const username = 'dbu10101021';
        const password = 'Admin123#';

        console.log(`Testing login for: ${username}`);

        // 1. Find user
        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            console.error('❌ User not found in database!');
            await mongoose.disconnect();
            return;
        }
        console.log('✅ User found.');

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match: ${isMatch}`);
        if (!isMatch) {
            console.error('❌ Password mismatch!');
            // Let's see what the hash is
            console.log(`Hash in DB: ${user.password}`);
            await mongoose.disconnect();
            return;
        }
        console.log('✅ Password matches.');

        // 3. Test save (this happens during login to update lastLogin)
        try {
            user.lastLogin = new Date();
            await user.save();
            console.log('✅ User save successful (lastLogin updated).');
        } catch (saveError) {
            console.error('❌ User save FAILED!');
            console.error(saveError);
        }

        await mongoose.disconnect();
        console.log('Database disconnected.');
    } catch (error) {
        console.error('Error during test:', error);
        process.exit(1);
    }
}

testAcademicLogin();
