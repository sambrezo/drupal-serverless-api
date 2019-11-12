var mongoose = require('mongoose');

var FahrgebietSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    }
  },
  { collection: 'fahrgebiete' }
);

module.exports = mongoose.model('Fahrgebiet', FahrgebietSchema);
