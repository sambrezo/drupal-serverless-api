// Source: https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html

// A simple TOKEN authorizer example to demonstrate how to use an authorization token
// to allow or deny a request. In this example, the caller named 'user' is allowed to invoke
// a request if the client-supplied token value is 'allow'. The caller is not allowed to invoke
// the request if the token value is 'deny'. If the token value is 'Unauthorized', the function
// returns the 'Unauthorized' error with an HTTP status code of 401. For any other token value,
// the authorizer returns an 'Invalid token' error.

// See documentation on how error messages translate to status codes
// Error("Unauthorized") => 401, Deny policy => 403, other Errors => 500

const jwtDecode = require('jwt-decode');
const { getServiceApiClient, createUserClient } = require('../lib/drupal');
const { generatePolicy } = require('../lib/aws/iam')
const { isPositiveInteger } = require('../lib/helper');

module.exports.handler = async (event, context) => {
  // Serverless
  // You can also use the Request Type Authorizer by setting the type property.
  // In this case, your identitySource could contain multiple entries for your policy cache.
  // The default type is 'token'.
  var token = event.authorizationToken;

  // May throw 500 error if decode fails
  const tokenContents = jwtDecode(token.split(' ')[1]);

  // The sub value is a case-sensitive string containing a StringOrURI value
  if (!isPositiveInteger(tokenContents.sub) ||
      !Array.isArray(tokenContents.scopes)) {
    throw new Error('Unauthorized');  // 401
  }

  // May throw 500 if internal error occurs
  const axios = await createUserClient(token);

  // Validate token
  // Returns 200 even if token expired
  const tokenResponse = await axios.get('/oauth/debug')
    .catch(err => {
      console.log('OAuth error', err);
      throw new Error('Internal Server Error'); // 500
    })

  // Check if token expired (id=0)
  // Id can be of type integer or string
  if (parseInt(tokenResponse.data.id) === 0 ||
      parseInt(tokenResponse.data.id) !== parseInt(tokenContents.sub)) {
    throw new Error("Unauthorized");  // 401
  }

  const axiosAdmin = await getServiceApiClient();

  // Fetch user
  const userResponse = await axiosAdmin.get(`/user/${tokenContents.sub}`, {
    params: { '_format': 'json' }
  }).catch(err => {
    console.log('User error', err);
    throw new Error('Internal Server Error'); // 500
  })

  // Create a catch-all Allow policy for principalId
  const principalId = `user|${tokenContents.sub}`;
  // Caching explained: https://www.alexdebrie.com/posts/lambda-custom-authorizers/
  // However, the policy result is cached across all requested method ARNs
  // for which the custom authorizer is fronting.
  // Avoid "User is not authorized to access this resource"
  const authResponse = generatePolicy(principalId, 'Allow', '*' /* event.methodArn */);

  // Pass user and scopes to Lambda for access control
  authResponse.context = {
    permissions: JSON.stringify(tokenResponse.data.permissions),
    user: JSON.stringify(userResponse.data),
    scopes: JSON.stringify(tokenContents.scopes)
  };

  // Return 200
  return authResponse;
};

