const createError = require('http-errors');
const _ = require('lodash');

module.exports = (req, res, next) => {
  const userRoles = _.get(res.locals, 'user.roles', [])
    .filter(role => role.target_type == 'user_role')
    .map(role => role.target_id);

  const isSelf = parseInt(req.params.uid) === _.get(res.locals, 'user.uid[0].value');

  if (userRoles.includes('administrator') || isSelf) {
    next();
  } else {
    next(createError(403, 'Admin or self only'));
  }
}
