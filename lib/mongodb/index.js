const kmsUtils = require('../aws/kms');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const MONGODB_PROTO = process.env['MONGODB_PROTO'] || 'mongodb+srv';
const MONGODB_USERNAME = process.env['MONGODB_USERNAME'] || 'dbUser';
const MONGODB_PASSWORD_ENC = process.env['MONGODB_PASSWORD'];
const MONGODB_HOST = process.env['MONGODB_HOST'];
const MONGODB_PORT = process.env['MONGODB_PORT'] || 27017;
const MONGODB_DATABASE = process.env['MONGODB_DATABASE'] || 'test';

let isConnected;

module.exports = connectToMongoDB = async () => {
  if (!isConnected) {
    const MONGODB_PASSWORD = await kmsUtils.decryptEncoded(MONGODB_PASSWORD_ENC);
    const MONGODB_URI = `${MONGODB_PROTO}://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}?retryWrites=true`;

    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true
    })
    isConnected = db.connections[0].readyState;
  }
};
