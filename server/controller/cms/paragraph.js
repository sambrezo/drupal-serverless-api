const _ = require('lodash');
const createError = require('http-errors');
const { getBasicClient } = require('../../../lib/drupal');

module.exports.cmsParagraphSingleGet = async (req, res, next) => {
  try {
    const axios = await getBasicClient();
    const response = await axios.get(`/${res.locals.lang}/entity/paragraph/${req.params.pid}`, {
       params: { _format: "json" }
    });

    if (_.get(response.data, 'type[0].target_type') !== 'paragraphs_type') {
      throw createError(400, 'Invalid URL');
    }

    return res.json(response.data)
  } catch (error) {
    next(error)
  }
};
