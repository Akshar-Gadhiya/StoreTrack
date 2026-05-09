const ownerService = require('../services/ownerService');
const { logAction } = require('../services/activityLogService');

const getOwners = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;
    const data = await ownerService.searchOwners({ page, limit, search, status });
    res.json(data);
  } catch (error) {
    console.error('Master Admin get owners error:', error);
    res.status(500).json({ message: error.message || 'Server error retrieving owners' });
  }
};

const getOwnerById = async (req, res) => {
  try {
    const owner = await ownerService.findOwnerById(req.params.id);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    const storeDetails = await ownerService.getOwnerStoreDetails(owner._id);
    return res.json({ ...owner, ...storeDetails });
  } catch (error) {
    console.error('Master Admin get owner error:', error);
    res.status(500).json({ message: error.message || 'Server error retrieving owner details' });
  }
};

const createOwner = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const owner = await ownerService.createOwner({
      name,
      email,
      password,
      createdBy: req.user._id,
    });

    await logAction({
      action: 'create_owner',
      itemId: owner._id,
      itemName: owner.name,
      details: `Master Admin created owner ${owner.email}`,
      userId: req.user._id,
      newValue: { name: owner.name, email: owner.email, role: owner.role },
    });

    res.status(201).json({
      _id: owner._id,
      name: owner.name,
      email: owner.email,
      role: owner.role,
      status: owner.status,
      createdAt: owner.createdAt,
    });
  } catch (error) {
    console.error('Master Admin create owner error:', error);
    res.status(400).json({ message: error.message || 'Unable to create owner' });
  }
};

const updateOwner = async (req, res) => {
  try {
    const { name, email, status } = req.body;
    const updatedOwner = await ownerService.updateOwner(req.params.id, { name, email, status });

    await logAction({
      action: status === 'suspended' ? 'suspend_owner' : 'edit_owner',
      itemId: updatedOwner._id,
      itemName: updatedOwner.name,
      details: `Master Admin updated owner ${updatedOwner.email}`,
      userId: req.user._id,
      oldValue: { name: req.body.name, email: req.body.email, status: req.body.status },
      newValue: { name: updatedOwner.name, email: updatedOwner.email, status: updatedOwner.status },
    });

    res.json({
      _id: updatedOwner._id,
      name: updatedOwner.name,
      email: updatedOwner.email,
      role: updatedOwner.role,
      status: updatedOwner.status,
      createdAt: updatedOwner.createdAt,
    });
  } catch (error) {
    console.error('Master Admin update owner error:', error);
    res.status(400).json({ message: error.message || 'Unable to update owner' });
  }
};

const resetOwnerPassword = async (req, res) => {
  try {
    const { password } = req.body;
    await ownerService.resetOwnerPassword(req.params.id, password);

    await logAction({
      action: 'reset_owner_password',
      itemId: req.params.id,
      itemName: `Owner ${req.params.id}`,
      details: `Master Admin reset password for owner ${req.params.id}`,
      userId: req.user._id,
    });

    res.json({ message: 'Owner password reset successfully' });
  } catch (error) {
    console.error('Master Admin reset owner password error:', error);
    res.status(400).json({ message: error.message || 'Unable to reset password' });
  }
};

module.exports = {
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  resetOwnerPassword,
};