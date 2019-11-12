const _ = require('lodash');
const createError = require('http-errors');
const { getBasicClient } = require('../../../lib/drupal');

module.exports.cmsMediaSingleGet = async (req, res, next) => {
  try {
    const axios = await getBasicClient();
    const response = await axios.get(`/${res.locals.lang}/media/${req.params.mid}`, {
       params: { _format: "json" }
    });

    if (_.get(response.data, 'bundle[0].target_type') !== 'media_type') {
      throw createError(400, 'Invalid URL');
    }

    if (req.query.redirect) {
      // Redirect to S3 for Remote Image
      return res.redirect(_.get(response.data, 'field_media_image[0].url'));
    }

    return res.json(response.data)
  } catch (error) {
    next(error)
  }
};
