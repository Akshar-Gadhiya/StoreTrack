const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const listDatabases = async () => {
    try {
        const client = await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const admin = client.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('Databases in cluster:');
        dbs.databases.forEach(db => console.log(`- ${db.name}`));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

listDatabases();
