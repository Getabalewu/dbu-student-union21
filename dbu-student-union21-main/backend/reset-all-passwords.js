const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Standard password for all users
const NEW_PASSWORD = 'Test@1234';

async function resetAllPasswords() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected!\n');

        const User = require('./models/User');

        // Get all users
        const users = await User.find({});

        console.log(`Found ${users.length} users. Resetting all passwords...\n`);

        // Hash the password once
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

        console.log(`New password hash: ${hashedPassword.substring(0, 30)}...`);

        // Update all users
        const result = await User.updateMany(
            {},
            {
                $set: {
                    password: hashedPassword,
                    isLocked: false,
                    loginAttempts: 0
                },
                $unset: { lockUntil: 1 }
            }
        );

        console.log(`\nUpdated ${result.modifiedCount} users`);

        // Verify a random user
        const testUser = await User.findOne({}).select('+password');
        const verifyMatch = await bcrypt.compare(NEW_PASSWORD, testUser.password);
        console.log(`\nVerification test for ${testUser.username}: ${verifyMatch ? 'PASSED' : 'FAILED'}`);

        console.log('\n=== All Users Reset ===');
        console.log(`Password for ALL accounts: ${NEW_PASSWORD}`);
        console.log('\nYou can login with any of these usernames:');

        const allUsers = await User.find({}).select('username name isAdmin');
        allUsers.forEach(u => {
            console.log(`  ${u.username} (${u.name})${u.isAdmin ? ' [ADMIN]' : ''}`);
        });

        await mongoose.disconnect();
        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetAllPasswords();
