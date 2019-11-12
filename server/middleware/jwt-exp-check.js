const createError = require('http-errors');
const jwtDecode = require('jwt-decode');

// NO AUTHENTICATION HERE

// Check if token expired before Lambda authorizer TTL (cached policy)
// The API makes follow-up requests on behalf of the user (createUserClient)
// Drupal JSON:API silently ignores expired tokens
// To avoid empty/incomplete responses, preemptively send 401 if token has expired

// Expire token 30 seconds early
const CLOCK_TOLERANCE = -30;

module.exports = (req, res, next) => {
  const token = req.get('Authorization');

  // Only verify exp if token is present
  // Again, we do not authenticate, see tokenValidator
  if (token) {
    const clockTimestamp = Math.floor(Date.now() / 1000);
    try {
      const tokenContents = jwtDecode(token.split(' ')[1]);
      // Code taken from: auth0/node-jsonwebtoken
      if (typeof tokenContents.exp !== 'undefined') {
        if (typeof tokenContents.exp !== 'number') {
          throw new Error('invalid exp value');
        }
        if (clockTimestamp >= tokenContents.exp + CLOCK_TOLERANCE) {
          throw new Error('jwt expired', new Date(tokenContents.exp * 1000));
        }
      }
    } catch(err) {
      console.log(err)
      // Initiate token refresh by client
      return next(createError(401));
    }
  }
  next();
}
