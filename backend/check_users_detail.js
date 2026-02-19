const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUsersDetail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log('Users in DB:');
        users.forEach(u => {
            console.log(JSON.stringify({
                email: u.email,
                emailLength: u.email.length,
                name: u.name,
                role: u.role
            }, null, 2));
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUsersDetail();
