const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const { getRoleDefaults } = require('./config/rolePermissions');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

app.set('io', io);

const PORT = process.env.PORT || 5001;

const ensureMasterAdmin = async () => {
    const email = process.env.MASTER_ADMIN_EMAIL || 'masteradmin@storetrack.local';
    const password = process.env.MASTER_ADMIN_PASSWORD || 'MasterAdmin123!';
    const name = process.env.MASTER_ADMIN_NAME || 'Master Admin';

    const existingAdmin = await User.findOne({ role: 'MASTER_ADMIN' });
    if (existingAdmin) {
        console.log(`Master admin already exists: ${existingAdmin.email}`);
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'MASTER_ADMIN',
        permissions: getRoleDefaults('MASTER_ADMIN'),
    });

    console.log('Created default MASTER_ADMIN account:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log('Change the password immediately after first login.');
};

const startServer = async () => {
    try {
        await connectDB();
        await ensureMasterAdmin();

        app.use(cors());
        app.use(express.json());
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });

        app.use('/api/master-admin/auth', require('./routes/masterAdminAuthRoutes'));
        app.use('/api/master-admin/stores', require('./routes/masterAdminStoreRoutes'));
        app.use('/api/master-admin/owners', require('./routes/masterAdminOwnerRoutes'));
        app.use('/api/permissions', require('./routes/permissionRoutes'));
        app.use('/api/master-items', require('./routes/masterItemRoutes'));

        app.get('/', (req, res) => {
            res.send('API is running...');
        });

        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ message: 'Something went wrong!' });
        });

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
