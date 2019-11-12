const { param, query, exists, validationResult } = require('express-validator/check');

const { getBasicClient } = require('../../../../lib/drupal');

const JSONAPI_ALLOWED_TYPE = ['faq', 'fahrziel']
const JSONAPI_ALLOWED_INCLUDES = [
  // Node Fahrziel
  'field_banner',
  'field_banner.field_media_image',
  'field_paragraph_treffpunkt',
  'field_paragraph_treffpunkt.field_treffpunkt_images',
  'field_paragraph_treffpunkt.field_treffpunkt_images.field_media_image',
  // Node FAQ
  'field_faq_category'
]

function includeValidator(include) {
  return new Promise((resolve, reject) => {
    const disallowed = include.split(',')
      .filter(value => !JSONAPI_ALLOWED_INCLUDES.includes(value))
    if (disallowed.length) {
      reject('Disallowed values: ' + disallowed)
    } else {
      resolve()
    }
  })
}

module.exports.cmsJsonApiNodeSingleGet = [
  param('type').isIn(JSONAPI_ALLOWED_TYPE),
  param('uuid').isUUID(4),
  query('include').optional().custom(includeValidator),
  query('consumerId').optional().isUUID(4),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next()
  },
  (req, res, next) => {
    getBasicClient()
      .then(axios => {
        return axios.get(`/${res.locals.lang}/jsonapi/node/${req.params.type}/${req.params.uuid}`, {
          params: {
            include: req.query.include,
            // Required for image styles
            consumerId: req.query.consumerId
          }
        })
      })
      .then(response => res.json(response.data))
      .catch(next)
  }
]


module.exports.cmsJsonApiNodeCollectionGet = [
  param('type').isIn(JSONAPI_ALLOWED_TYPE),
  query('include').optional().custom(includeValidator),
  query('consumerId').optional().isUUID(4),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next()
  },
  (req, res, next) => {
    getBasicClient()
      .then(axios => {
        return axios.get(`/${res.locals.lang}/jsonapi/node/${req.params.type}`, {
          params: {
            include: req.query.include,
            consumerId: req.query.consumerId
          }
        })
      })
      .then(response => res.json(response.data))
      .catch(next)
  }
]



