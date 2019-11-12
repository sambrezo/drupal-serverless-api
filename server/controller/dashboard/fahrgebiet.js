const { body, param, validationResult } = require('express-validator/check');

const multer = require('multer');
const upload = multer({ dest: '/tmp/' });
const geojsonStream = require('geojson-stream');
const es = require('event-stream')
const fs = require('fs');

const connectToMongoDB = require('../../../lib/mongodb');
const FahrgebietModel = require('../../model/fahrgebiet');
const GeojsonModel = require('../../model/geojson');

const fahrgebietMiddleware = require('../../middleware/fahrgebiet-ref');

module.exports.fahrgebietGet = (req, res, next) => {
  connectToMongoDB()
    .then(() => FahrgebietModel.find({}))
    .then(fahrgebiete => res.json({ fahrgebiete }))
    .catch(next);
};

module.exports.fahrgebietPost = [
  body('title').not().isEmpty(),
  body('slug').isAlpha().isLowercase(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  (req, res, next) => {
    connectToMongoDB()
      .then(() => new FahrgebietModel(req.body).save())
      .then(res.json)
      .catch(next)
  }
];

module.exports.fahrgebietAreaUpload = [
  fahrgebietMiddleware,
  upload.single('geojson'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  (req, res, next) => {
    connectToMongoDB()
      .then(() => GeojsonModel.deleteMany({ fahrgebiet: res.locals.fahrgebiet }))
      .then(() => {
        return new Promise((resolve, reject) => {
          fs.createReadStream(req.file.path)
            .pipe(geojsonStream.parse())
            .on('error', reject)
            .pipe(es.map((geojsonFeature, callback) => {
              new GeojsonModel({
                feature: geojsonFeature,
                fahrgebiet: res.locals.fahrgebiet
              }).save()
                .then(geojsonModel => callback(null, geojsonModel))
                .catch(callback)
            }))
            .on('error', reject)
            .on('end', resolve);
        })
      })
      .then(() => res.sendStatus(200))
      .catch(next);
  }
];
