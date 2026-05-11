const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testHashing = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'test_' + Date.now() + '@example.com';
        const password = 'mypassword123';

        console.log(`Registering user: ${email} with password: ${password}`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(`Hashed password: ${hashedPassword}`);

        const user = await User.create({
            name: 'Test User',
            email: email,
            password: hashedPassword,
            role: 'owner'
        });
        console.log('User created successfully');

        console.log('Attempting login logic...');
        const foundUser = await User.findOne({ email });
        console.log(`User found: ${foundUser ? 'YES' : 'NO'}`);

        const isMatch = await bcrypt.compare(password, foundUser.password);
        console.log(`Password match with bcrypt.compare: ${isMatch ? 'YES' : 'NO'}`);

        // Cleanup
        await User.deleteOne({ _id: foundUser._id });
        console.log('Test user deleted');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testHashing();
