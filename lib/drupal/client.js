'use strict';

const axios = require('axios');
const qs = require('qs');

const httpsAgent = require('./https-agent')
const subrequests = require('./subrequests')

// Basic unauthorized client allowed to make Drupal API calls
const createAxiosClient = async (drupalHost) => {
  const instance = axios.create({
    httpsAgent,
    baseURL: `https://${drupalHost}`,
  });
  // Automatically parse subrequest response
  instance.interceptors.response.use(subrequests.interceptor);
  return instance;
}

// Used to make API calls on behalf of the user
const createAxiosClientWithToken = async (drupalHost, authToken) => {
  const instance = await createAxiosClient(drupalHost)
  instance.defaults.headers.common['Authorization'] = authToken;
  return instance;
}

// Used for Service API (slow, but more secure)
const createAxiosClientWithTokenFromOauth = async (drupalHost, clientId, clientSecret) => {
  const instance = await createAxiosClient(drupalHost);

  // Client cert not required for this route, but we provide it anyway
  const oauthResponse = await instance.post('/oauth/token', qs.stringify({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  // Token expires shortly. Not suited for Lambda container reuse
  const authToken = `${oauthResponse.data.token_type} ${oauthResponse.data.access_token}`;
  instance.defaults.headers.common['Authorization'] = authToken;
  return instance;
}

// Used for Service API (faster)
const createAxiosClientWithBasicAuth = async (drupalHost, username, password) => {
  const instance = await createAxiosClient(drupalHost);
  instance.defaults.auth = { username, password };
  return instance;
}

module.exports = {
  createAxiosClient,
  createAxiosClientWithToken,
  createAxiosClientWithTokenFromOauth,
  createAxiosClientWithBasicAuth,
}
