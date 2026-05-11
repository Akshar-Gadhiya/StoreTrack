const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('Total users found:', users.length);

        if (users.length > 0) {
            console.log('User list (sanitized):');
            users.forEach(u => {
                const passPrefix = u.password ? u.password.substring(0, 7) : 'NONE';
                console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, PassPrefix: ${passPrefix}`);
            });
        } else {
            console.log('No users found in the database.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkUsers();
