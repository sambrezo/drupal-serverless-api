const drupalClient = require('./client');
const kmsUtils = require('../aws/kms');

var basicClient;
var serviceApiClient;

module.exports.getBasicClient = async () => {
  if (!basicClient) {
    const drupalHost = process.env['DRUPAL_HOST'];
    // Reuse client
    basicClient = drupalClient.createAxiosClient(drupalHost);
  }

  return basicClient;
}

module.exports.getServiceApiClient = async () => {
  if (!serviceApiClient) {
    const drupalHost = process.env['DRUPAL_HOST'];
    const drupalServiceApiUsername = process.env['DRUPAL_SERVICE_API_BASIC_AUTH_USER'];
    var drupalServiceApiPassword = process.env['DRUPAL_SERVICE_API_BASIC_AUTH_PASS'];

    // Decrypt password using AWS KMS (network)
    drupalServiceApiPassword = await kmsUtils.decryptEncoded(drupalServiceApiPassword);

    // Reuse client
    serviceApiClient = drupalClient.createAxiosClientWithBasicAuth(drupalHost, drupalServiceApiUsername, drupalServiceApiPassword);
  }

  return serviceApiClient;
}

module.exports.createUserClient = async (token) => {
  const drupalHost = process.env['DRUPAL_HOST'];

  return drupalClient.createAxiosClientWithToken(drupalHost, token);
}


module.exports.createServiceApiClient = async () => {
  const drupalHost = process.env['DRUPAL_HOST'];
  const drupalServiceApiClientId = process.env['DRUPAL_SERVICE_API_CLIENT_ID'];
  var drupalServiceApiClientSecret = process.env['DRUPAL_SERVICE_API_CLIENT_SECRET'];

  // KmsUtils caches decrypted secrets for Lambda container lifecycle
  drupalServiceApiClientSecret = await kmsUtils.decryptEncoded(drupalServiceApiClientSecret);

  return drupalClient.createAxiosClientWithTokenFromOauth(drupalHost, drupalServiceApiClientId, drupalServiceApiClientSecret);
}
