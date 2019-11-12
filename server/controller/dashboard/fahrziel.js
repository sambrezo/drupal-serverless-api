const { body, param, validationResult } = require('express-validator/check');

const connectToMongoDB = require('../../../lib/mongodb');
const FahrzielModel = require('../../model/fahrziel');

module.exports.fahrzielGet = (req, res, next) => {
  connectToMongoDB()
    .then(() => FahrzielModel.find({}))
    .then(fahrziele => res.json({ fahrziele }))
    .catch(next);
};

module.exports.fahrzielByNodeIdGet = (req, res, next) => {
  connectToMongoDB()
    .then(() => FahrzielModel.find({}))
    .then(fahrziele => res.json({ fahrziele }))
    .catch(next);
};

module.exports.fahrzielPost = [
  body('slug').isAlpha().isLowercase(),
  body('drupalNodeId').isInt().optional(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  (req, res, next) => {
    connectToMongoDB()
      .then(() => new FahrzielModel(req.body).save())
      .then(res.json)
      .catch(next)
  }
];
