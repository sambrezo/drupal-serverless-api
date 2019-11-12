const createError = require('http-errors');

// Add to bottom of route stack
module.exports = (req, res, next) => {
  if (!res.headersSent) {
    // catch 404 and forward to error handler
    return next(createError(404));
  }
  next();
}
