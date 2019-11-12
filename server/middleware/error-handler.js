const createError = require('http-errors');

/**
 * HAAAAAAAAAAAAPI
 */

module.exports = (err, req, res, next) => {
  // So when you add a custom error handler,
  // you must delegate to the default Express error handler,
  // when the headers have already been sent to the client
  if (res.headersSent) {
    return next(err);
  }

  // Custom http-errors with createError
  if (err instanceof createError.HttpError) {
    // Express outputs errors in HTML by default
    return res.status(err.status).json(err);
  }

  // Mongoose
  if (err.name === 'ValidationError') {
    // FIXME: Default error handler acknowledges status code, but outputs HTML
    // Better discriminator available (see below)?
    return next(createError(400, err));
  }

  // Axios
  if (err.response) {
    // Wait for err.isAxiosError
    // err.reponse.data includes message at least
    return res.status(err.response.status).json(err.response.data);
  }

  next(err);
}

// const { MongoError } = require('mongodb');

// app.use(function handleAssertionError(error, req, res, next) {
//   if (error instanceof AssertionError) {
//     return res.status(400).json({
//       type: 'AssertionError',
//       message: error.message
//     });
//   }
//   next(error);
// });

// app.use(function handleDatabaseError(error, req, res, next) {
//   if (error instanceof MongoError) {
//     return res.status(503).json({
//       type: 'MongoError',
//       message: error.message
//     });
//   }
//   next(error);
// });
