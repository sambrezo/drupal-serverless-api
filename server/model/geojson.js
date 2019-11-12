var GeoJSON = require('mongoose-geojson-schema');
var mongoose = require('mongoose');

var GeojsonSchema = new mongoose.Schema(
  {
    feature: {
      type: mongoose.Schema.Types.Feature,
      required: true
    },
    fahrgebiet: {
      type: mongoose.Schema.ObjectId,
      ref: 'Fahrgebiet',
      required: true
    },
  },
  { collection: 'geojson' }
);

GeojsonSchema.index({'feature.geometry': '2dsphere'});

module.exports = mongoose.model('Geojson', GeojsonSchema);
