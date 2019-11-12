const serverless = require('serverless-http');
const slsHttpConf = require('./core/sls-http-conf');
const app = require('./core/app');

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

const {
  cmsLayoutGet, cmsNodeSingleGet, cmsNodeCollectionGet,
  cmsJsonApiNodeSingleGet, cmsJsonApiNodeCollectionGet,
  cmsMediaSingleGet,
  cmsParagraphSingleGet
} = require('./controller/cms');

app.get('/cms/layout', cmsLayoutGet);
app.get('/cms/node/single/by-url-alias/*', cmsNodeSingleGet);
app.get('/cms/node/collection/by-content-type/:type', cmsNodeCollectionGet);
app.get('/cms/jsonapi/node/:type/:uuid', cmsJsonApiNodeSingleGet);
app.get('/cms/jsonapi/node/:type', cmsJsonApiNodeCollectionGet);
app.get('/cms/paragraph/:pid(\\d+)', cmsParagraphSingleGet);
app.get('/cms/media/:mid(\\d+)', cmsMediaSingleGet);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports.handler = serverless(app, slsHttpConf);
