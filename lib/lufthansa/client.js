'use strict';

const axios = require('axios');
const qs = require('qs');

// Axios custom config workaround
// https://github.com/axios/axios/pull/2207
// https://github.com/softonic/axios-retry/blob/v19-support/es/index.js
const namespace = Symbol('custom-config');

module.exports.createAxiosClientWithTokenFromOauth = async (lufthansaBaseUrl, clientId, clientSecret) => {
  // Default headers
  // 'Accept': 'application/json, text/plain, */*'
  const instance = axios.create({
    // Fully qualified with PROTO
    baseURL: lufthansaBaseUrl,
  });

  const createdAt = Date.now();
  const oauthResponse = await instance.post('/oauth/token', qs.stringify({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  // Token expires in 21600 seconds
  // Client might seldomly be reused because Lambda container lifecycle is short
  const authToken = `Bearer ${oauthResponse.data.access_token}`;
  instance.defaults.headers.common['Authorization'] = authToken;
  instance[namespace] = {
    expirationTime: createdAt + oauthResponse.data.expires_in * 1000
  }
  return instance;
}

module.exports.isExpired = lufthansaApiClient => {
  if (lufthansaApiClient) {
    if ((lufthansaApiClient[namespace] || {}).expirationTime) {
      const expirationTime = lufthansaApiClient[namespace].expirationTime;
      return Date.now() >= expirationTime
    }
  }
  return true;
}


