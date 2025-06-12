const MaterialKit = require('../models/MaterialKit');
const generateToken = require('../utils/generateToken');
exports.getAllKits = async (req, res) => {
try {
  const kits = await MaterialKit.find();
  res.json(kits);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

exports.getKitById = async (req, res) => {
try {
  const kit = await MaterialKit.findById(req.params.id);
  if (!kit) return res.status(404).json({ message: 'Not found' });
  res.json(kit);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};
