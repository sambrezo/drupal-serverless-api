const { body, param, validationResult } = require('express-validator/check');

const connectToMongoDB = require('../../lib/mongodb');
const FahrgebietModel = require('../model/fahrgebiet');

module.exports = [
  param('slug').isAlpha().isLowercase(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.mapped.slug) {
      return res.status(400).json({ errors: errors.array() });
    }
    connectToMongoDB()
      .then(() => FahrgebietModel.findOne({ slug: req.params.slug }))
      .then(fahrgebiet => {
        if (!fahrgebiet) {
          return res.status(404).json({
            message: 'Fahrgebiet not found'
          });
        }
        res.locals.fahrgebiet = fahrgebiet;
        next();
      })
      .catch(next)
  }
]
