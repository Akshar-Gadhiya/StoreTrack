const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const crawlDB = async () => {
    try {
        const client = await mongoose.connect(process.env.MONGO_URI);
        const admin = client.connection.db.admin();
        const dbs = await admin.listDatabases();

        for (const dbInfo of dbs.databases) {
            console.log(`Checking DB: ${dbInfo.name}`);
            try {
                const db = client.connection.useDb(dbInfo.name);
                const collections = await db.listCollections().toArray();
                for (const col of collections) {
                    const count = await db.collection(col.name).countDocuments();
                    console.log(`  - ${col.name}: ${count} docs`);
                    if (count > 0 && (col.name.includes('user') || col.name.includes('account') || col.name.includes('auth'))) {
                        const sample = await db.collection(col.name).findOne({});
                        console.log(`    Sample: ${JSON.stringify(Object.keys(sample))}`);
                    }
                }
            } catch (e) {
                console.log(`  Could not access ${dbInfo.name}: ${e.message}`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

crawlDB();
