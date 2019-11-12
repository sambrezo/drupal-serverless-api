const serverless = require('serverless-http');
const slsHttpConf = require('./core/sls-http-conf');
const app = require('./core/app');

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const adminOrSelfMiddleware = require('./middleware/admin-or-self');
const profilesMiddleware = require('./middleware/profiles-ref');

const { userRegisterPost } = require ('./controller/user')

app.post('/user/register', userRegisterPost);

app.get('/user/self', (req, res) => {
  return res.json(res.locals.user);
})

app.use(['/user/:uid', '/user/:uid/*'], adminOrSelfMiddleware)
app.get('/user/:uid(\\d+)/profiles', profilesMiddleware, (req, res) => {
  return res.json(res.locals.profiles);
})

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports.handler = serverless(app, slsHttpConf);
