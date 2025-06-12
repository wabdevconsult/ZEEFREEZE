// controllers/technicianController.js
const User = require('../models/User');

// Fonction de mapping pour formater les données
const mapToTechnicianFormat = (user) => ({
  _id: user._id,
  firstName: user.firstName || user.name?.split(' ')[0] || '',
  lastName: user.lastName || user.name?.split(' ')[1] || '',
  email: user.email,
  phone: user.phone,
  skills: user.skills || [],
  availability: user.availability !== false,
  createdAt: user.createdAt
});

exports.createTechnician = async (req, res) => {
  try {
    const technicianData = {
      ...req.body,
      role: 'technician',
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      name: `${req.body.firstName} ${req.body.lastName}`,
      skills: req.body.skills,
      availability: req.body.availability !== false
    };
    
    const user = await User.create(technicianData);
    res.status(201).json(mapToTechnicianFormat(user));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllTechnicians = async (req, res) => {
  try {
    const users = await User.find({ role: 'technician' });
    res.json(users.map(mapToTechnicianFormat));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTechnicianById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'technician' });
    if (!user) return res.status(404).json({ message: 'Technician not found' });
    res.json(mapToTechnicianFormat(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTechnician = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'technician' },
      { $set: req.body },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Technician not found' });
    res.json(mapToTechnicianFormat(user));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTechnician = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'technician' });
    if (!user) return res.status(404).json({ message: 'Technician not found' });
    res.json({ message: 'Technician deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};