const express = require('express');
const serverless = require('serverless-http');
const slsHttpConf = require('./core/sls-http-conf');
const app = require('./core/app');

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

const {
  lufthansaFlightStatusGet
} = require('./controller/flights');

const lufthansaRouter = express.Router();
app.use('/flights/lh', lufthansaRouter);

lufthansaRouter.get('/operations/flightstatus/:flightNumber/:date', lufthansaFlightStatusGet);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports.handler = serverless(app, slsHttpConf);
