const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new Schema({
  symbol: { type: String, required: true, unique: true },
  likes: { type: Number, default: 0 },
  ips: { type: [String], default: [] }
});

module.exports = mongoose.model('Stock', stockSchema);
