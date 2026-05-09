const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Store = require('../models/Store');

const buildOwnerQuery = ({ search, status }) => {
  const query = { role: 'owner' };

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [
      { name: { $regex: regex } },
      { email: { $regex: regex } },
    ];
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  return query;
};

const searchOwners = async ({ search, status, page = 1, limit = 10 }) => {
  const query = buildOwnerQuery({ search, status });
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

  const total = await User.countDocuments(query);
  const owners = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .select('-password')
    .lean();

  const ownerIds = owners.map((owner) => owner._id);
  const storeCounts = await Store.aggregate([
    { $match: { owner: { $in: ownerIds } } },
    { $group: { _id: '$owner', count: { $sum: 1 } } },
  ]);

  const storeCountMap = storeCounts.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  const ownersWithStoreCounts = owners.map((owner) => ({
    ...owner,
    storeCount: storeCountMap[owner._id.toString()] || 0,
  }));

  const summary = {
    totalOwners: await User.countDocuments({ role: 'owner' }),
    activeOwners: await User.countDocuments({ role: 'owner', status: 'active' }),
    suspendedOwners: await User.countDocuments({ role: 'owner', status: 'suspended' }),
    totalStores: await Store.countDocuments({}),
  };

  return {
    owners: ownersWithStoreCounts,
    total,
    page: pageNumber,
    pages: Math.ceil(total / pageSize),
    summary,
  };
};

const findOwnerById = async (ownerId) => {
  return await User.findOne({ _id: ownerId, role: 'owner' }).select('-password').lean();
};

const createOwner = async ({ name, email, password, createdBy }) => {
  const existing = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
  if (existing) {
    throw new Error('Owner with this email already exists');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return await User.create({
    name,
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    role: 'owner',
    status: 'active',
    createdBy,
  });
};

const updateOwner = async (ownerId, updates) => {
  const owner = await User.findOne({ _id: ownerId, role: 'owner' });
  if (!owner) {
    throw new Error('Owner not found');
  }

  if (updates.email) {
    const existing = await User.findOne({
      email: { $regex: new RegExp(`^${updates.email}$`, 'i') },
      _id: { $ne: ownerId },
    });
    if (existing) {
      throw new Error('Email already in use');
    }
    owner.email = updates.email.trim().toLowerCase();
  }

  if (updates.name) owner.name = updates.name;
  if (updates.status) owner.status = updates.status;

  return await owner.save();
};

const resetOwnerPassword = async (ownerId, password) => {
  const owner = await User.findOne({ _id: ownerId, role: 'owner' });
  if (!owner) {
    throw new Error('Owner not found');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  const salt = await bcrypt.genSalt(10);
  owner.password = await bcrypt.hash(password, salt);
  return await owner.save();
};

const getOwnerStoreDetails = async (ownerId) => {
  const stores = await Store.find({ owner: ownerId })
    .select('name address status phone email createdAt')
    .lean();

  return {
    stores,
    storeCount: stores.length,
  };
};

module.exports = {
  searchOwners,
  findOwnerById,
  createOwner,
  updateOwner,
  resetOwnerPassword,
  getOwnerStoreDetails,
};