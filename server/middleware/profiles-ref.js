const { check, validationResult } = require('express-validator/check');

const { getServiceApiClient } = require('../../lib/drupal');

module.exports = [
  check('uid').isInt(),
  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const axiosAdmin = await getServiceApiClient();
      const srResponse = await axiosAdmin.post('/subrequests', [
        {
          "requestId": "req-1",
          "uri": "/jsonapi/profile_type/profile_type",
          "action": "view",
          "headers": {
            "Accept": "application/json"
          }
        },
        {
          "requestId": "req-2",
          "waitFor": ["req-1"],
          "uri": `/jsonapi/profile/{{req-1.body@$.data[*].attributes.drupal_internal__id}}?filter[uid.drupal_internal__uid]=${req.params.uid}`,
          "action": "view",
          "headers": {
            "Accept": "application/json"
          }
        }
      ]);

      const userProfiles = srResponse.data.find(response => /req-2/.test(response.headers['Content-Id'])).data;
      res.locals.profiles = userProfiles;
      next();
    } catch (error) {
      next(error)
    }
  }
];
