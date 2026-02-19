const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkOtherDB = async () => {
    try {
        // Change database name in URI temporarily
        const uri = process.env.MONGO_URI.replace('/invtrack', '/storetrack');
        console.log(`Connecting to: ${uri}`);

        const client = await mongoose.connect(uri);
        console.log('Connected to storetrack DB');

        const db = client.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections in storetrack DB:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name} (${count} documents)`);

            const sample = await db.collection(col.name).findOne({});
            console.log(`Sample from ${col.name}:`, JSON.stringify(sample, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkOtherDB();
