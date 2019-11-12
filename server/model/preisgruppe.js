var mongoose = require('mongoose');

var PreisgruppeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: mongoose.Decimal128,
      required: true
    }
  },
  { collection: 'preisgruppen' }
);

module.exports = mongoose.model('Preisgruppe', PreisgruppeSchema);
