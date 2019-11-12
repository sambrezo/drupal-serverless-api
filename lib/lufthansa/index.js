const lufthansaClient = require('./client');
const kmsUtils = require('../aws/kms');

var lufthansaApiClient;

module.exports.getLufthansaApiClient = async () => {
  if (!lufthansaApiClient || lufthansaClient.isExpired(lufthansaApiClient)) {
    const lufthansaBaseURL = process.env['LUFTHANSA_BASE_URL'];
    const lufthansaKey = process.env['LUFTHANSA_KEY'];
    var lufthansaSecret = process.env['LUFTHANSA_SECRET'];

    // Decrypt password using AWS KMS (network)
    lufthansaSecret = await kmsUtils.decryptEncoded(lufthansaSecret);

    // Reuse client
    lufthansaApiClient = lufthansaClient.createAxiosClientWithTokenFromOauth(lufthansaBaseURL, lufthansaKey, lufthansaSecret);
  }

  return lufthansaApiClient;
}
