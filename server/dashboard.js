const express = require('express');
const serverless = require('serverless-http');
const slsHttpConf = require('./core/sls-http-conf');
const app = require('./core/app');

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const adminOnlyMiddleware = require('./middleware/admin-only');

const {
  fahrgebietGet,
  fahrgebietPost,
  fahrgebietAreaUpload,
  fahrzielGet,
  fahrzielByNodeIdGet,
  fahrzielPost
} = require('./controller/dashboard');


const fahrgebietRouter = express.Router();
const fahrzielRouter = express.Router();

// Only admins should access routes
app.use('/fahrgebiet', adminOnlyMiddleware, fahrgebietRouter);
app.use('/fahrziel', adminOnlyMiddleware, fahrzielRouter);

fahrgebietRouter.get('/', fahrgebietGet);
fahrgebietRouter.post('/', fahrgebietPost);
fahrgebietRouter.post('/:slug/area/upload', fahrgebietAreaUpload);

fahrzielRouter.get('/', fahrzielGet);
fahrzielRouter.post('/', fahrzielPost);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports.handler = serverless(app, slsHttpConf);
