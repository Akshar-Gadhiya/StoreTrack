const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const listCollections = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections in database:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name} (${count} documents)`);

            if (col.name === 'storetrack') {
                const sample = await db.collection(col.name).findOne({});
                console.log('Sample from storetrack:', JSON.stringify(sample, null, 2));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

listCollections();
