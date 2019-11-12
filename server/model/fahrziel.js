
var mongoose = require('mongoose');

var FahrzielSchema = new mongoose.Schema(
  {
    drupalNodeId: {
      type: Number,
      unique: true,
      sparse: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    }
  },
  { collection: 'fahrziele' }
);

module.exports = mongoose.model('Fahrziel', FahrzielSchema);
