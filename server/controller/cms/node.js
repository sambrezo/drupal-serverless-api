const _ = require('lodash');
const createError = require('http-errors');
const { getBasicClient } = require('../../../lib/drupal');

/**
 * Security considerations:
 * This API call exposes Drupal to the world
 *
 * We take the following steps to restrict access:
 * 1) Axios basic client is the Unauthorized User in Drupal
 * 2) Only use GET requests
 * 3) Exclude specific administrative paths with RegEx
 * 4) Only return Node content
 *
 */
module.exports.cmsNodeSingleGet = async (req, res, next) => {
  try {
    const urlAlias = req.params[0];
    if (/^(jsonapi|entity)/.test(urlAlias)) {
      throw createError(403, 'Not allowed');
    }

    const axios = await getBasicClient();
    // Use Drupal REST module resource at /node/{node}
    // Accepts Node URL alias
    const response = await axios.get(`/${res.locals.lang}/${urlAlias}`, {
       params: { _format: "json" }
    });

    if (_.get(response.data, 'type[0].target_type') !== 'node_type') {
      throw createError(400, 'Invalid URL');
    }

    return res.json(response.data)
  } catch (error) {
    next(error)
  }
};

module.exports.cmsNodeCollectionGet = async (req, res, next) => {
  try {
    const axios = await getBasicClient();
    // Use custom Drupal View REST export at /node?type=
    const response = await axios.get(`/${res.locals.lang}/node`, {
       params: { _format: "json", type: req.params.type }
    });

    // Empty result set is formatted differently by Drupal
    if (_.get(response.data, 'content') === '[]') {
      return res.json([]);
    }

    return res.json(response.data)
  } catch (error) {
    next(error)
  }
};
