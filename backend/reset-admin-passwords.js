const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Admin usernames and new password
const ADMIN_USERNAMES = ['dbu10101040', 'dbu10101020', 'dbu10101030', 'dbu10101011'];
const NEW_PASSWORD = 'Admin123#';

async function resetAdminPasswords() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected!\n');

        const User = require('./models/User');

        // Hash the password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

        // Update specific admin users
        const result = await User.updateMany(
            { username: { $in: ADMIN_USERNAMES } },
            {
                $set: {
                    password: hashedPassword,
                    isLocked: false,
                    loginAttempts: 0
                },
                $unset: { lockUntil: 1 }
            }
        );

        console.log(`Updated ${result.modifiedCount} admin accounts\n`);

        // List updated admins
        const admins = await User.find({ username: { $in: ADMIN_USERNAMES } }).select('username name');
        console.log('=== Updated Admin Accounts ===');
        admins.forEach(a => {
            console.log(`  ${a.username} (${a.name})`);
        });
        console.log(`\nNew password: ${NEW_PASSWORD}`);

        await mongoose.disconnect();
        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetAdminPasswords();
