// controllers/clientController.js
const User = require('../models/User');

// Utilisez cette fonction de mapping si nécessaire
const mapToClientFormat = (user) => ({
  _id: user._id,
  type: user.clientType || 'autre',
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  notes: user.notes,
  createdAt: user.createdAt
});

exports.createClient = async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      role: 'client',
      clientType: req.body.type,
      name: req.body.name
    };
    const user = await User.create(clientData);
    res.status(201).json(mapToClientFormat(user));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getClients = async (req, res) => {
  try {
    const users = await User.find({ role: 'client' });
    res.json(users.map(mapToClientFormat));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'client' });
    if (!user) return res.status(404).json({ message: 'Client not found' });
    res.json(mapToClientFormat(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'client' },
      { $set: req.body },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Client not found' });
    res.json(mapToClientFormat(user));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'client' });
    if (!user) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};