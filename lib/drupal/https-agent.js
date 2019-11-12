const fs = require('fs');
const path = require('path');
const https = require('https');

const clientCertPath = path.resolve(__dirname, '../../client_cert');

const keyFile = path.resolve(clientCertPath, 'service_api.key')
const certFile = path.resolve(clientCertPath, 'service_api.crt')

// Nginx reverse proxy requires SSL client certificate
const httpsAgent = new https.Agent({
  key: fs.readFileSync(keyFile),
  cert: fs.readFileSync(certFile)
});

module.exports = httpsAgent;
