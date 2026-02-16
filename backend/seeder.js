const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs'); // Import bcrypt
const users = require('./data/users');
const stores = require('./data/stores');
const items = require('./data/items');
const logs = require('./data/logs');
const User = require('./models/User');
const Store = require('./models/Store');
const Item = require('./models/Item');
const ActivityLog = require('./models/ActivityLog');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await ActivityLog.deleteMany();
        await Item.deleteMany();
        await Store.deleteMany();
        await User.deleteMany();

        const hashedUsers = await Promise.all(users.map(async (user) => {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            return { ...user, password: hashedPassword };
        }));

        const createdUsers = await User.insertMany(hashedUsers);
        const adminUser = createdUsers[0]._id;

        const createdStores = await Store.insertMany(stores);
        const mainStore = createdStores[0]._id;
        const warehouseStore = createdStores[1]._id;

        // Assign store IDs to items
        const sampleItems = items.map((item, index) => {
            if (index < 3) {
                return { ...item, storeId: mainStore };
            } else {
                return { ...item, storeId: warehouseStore };
            }
        });

        await Item.insertMany(sampleItems);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await ActivityLog.deleteMany();
        await Item.deleteMany();
        await Store.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
