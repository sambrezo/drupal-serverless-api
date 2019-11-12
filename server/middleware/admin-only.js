const createError = require('http-errors');
const _ = require('lodash');

module.exports = (req, res, next) => {
  const userRoles = _.get(res.locals, 'user.roles', [])
    .filter(role => role.target_type == 'user_role')
    .map(role => role.target_id);

  if (userRoles.includes('administrator')) {
    next();
  } else {
    next(createError(403, 'Admin only'));
  }
}
