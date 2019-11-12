const express = require('express');
const cors = require('cors');

const jwtExpCheckMiddleware = require('../middleware/jwt-exp-check');
const userMiddleware = require('../middleware/user-ref');
const languageMiddleware = require('../middleware/language-ref');

const app = express();

// Hello world!
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(jwtExpCheckMiddleware);
app.use(userMiddleware);
app.use(languageMiddleware);

module.exports = app;
