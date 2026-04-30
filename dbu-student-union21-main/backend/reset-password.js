const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// CHANGE THESE VALUES
const USERNAME = 'dbu10304058';  // The username to reset
const NEW_PASSWORD = 'Test@1234';  // The new password (meets all requirements)

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected!\n');

        const User = require('./models/User');

        // Find the user
        const user = await User.findOne({ username: USERNAME }).select('+password');

        if (!user) {
            console.log(`User ${USERNAME} not found!`);
            await mongoose.disconnect();
            return;
        }

        console.log(`Found user: ${user.username} (${user.name})`);

        // Hash the new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

        // Update password and unlock account
        user.password = hashedPassword;
        user.isLocked = false;
        user.loginAttempts = 0;
        user.lockUntil = undefined;

        // Use updateOne to skip the pre-save hook (which would double-hash)
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    isLocked: false,
                    loginAttempts: 0
                },
                $unset: {
                    lockUntil: 1
                }
            }
        );

        console.log(`\nPassword reset successfully!`);
        console.log(`Username: ${USERNAME}`);
        console.log(`New Password: ${NEW_PASSWORD}`);
        console.log(`Account unlocked: Yes`);

        await mongoose.disconnect();
        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

resetPassword();
