const mongoose = require('mongoose');

const materialKitSchema = new mongoose.Schema({
  name: String,
  components: [Object],
}, { timestamps: true });

module.exports = mongoose.model('MaterialKit', materialKitSchema);
