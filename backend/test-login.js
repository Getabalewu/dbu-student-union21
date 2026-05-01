const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Test credentials
const USERNAME = 'dbu10304058';
const TEST_PASSWORD = 'Test@1234';

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected!\n');

        const User = require('./models/User');

        // Find user with password
        const user = await User.findOne({ username: USERNAME }).select('+password');

        if (!user) {
            console.log(`User ${USERNAME} not found!`);
            await mongoose.disconnect();
            return;
        }

        console.log('=== User Found ===');
        console.log(`Username: ${user.username}`);
        console.log(`Name: ${user.name}`);
        console.log(`Password hash length: ${user.password ? user.password.length : 'NO PASSWORD'}`);
        console.log(`Password starts with $2: ${user.password ? user.password.startsWith('$2') : false}`);
        console.log(`isActive: ${user.isActive}`);
        console.log(`isLocked: ${user.isLocked}`);

        // Test password comparison
        console.log('\n=== Testing Password ===');
        console.log(`Testing password: ${TEST_PASSWORD}`);

        const isMatch = await bcrypt.compare(TEST_PASSWORD, user.password);
        console.log(`Password match result: ${isMatch}`);

        if (!isMatch) {
            console.log('\nPassword does NOT match! Resetting password now...');

            // Hash new password
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(TEST_PASSWORD, salt);

            console.log(`New hash: ${hashedPassword.substring(0, 20)}...`);

            // Direct update to bypass pre-save hook
            const result = await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        password: hashedPassword,
                        isLocked: false,
                        loginAttempts: 0
                    },
                    $unset: { lockUntil: 1 }
                }
            );

            console.log(`Update result: ${JSON.stringify(result)}`);

            // Verify the update worked
            const updatedUser = await User.findOne({ username: USERNAME }).select('+password');
            const verifyMatch = await bcrypt.compare(TEST_PASSWORD, updatedUser.password);
            console.log(`\nVerification after reset: ${verifyMatch}`);

            if (verifyMatch) {
                console.log('\n✅ Password reset SUCCESSFUL!');
                console.log(`Login with: ${USERNAME} / ${TEST_PASSWORD}`);
            } else {
                console.log('\n❌ Password reset FAILED - there may be a deeper issue');
            }
        } else {
            console.log('\n✅ Password already matches! Login should work.');
            console.log(`Login with: ${USERNAME} / ${TEST_PASSWORD}`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testLogin();
