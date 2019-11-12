'use strict';

const AWS = require('aws-sdk');

// If your VPC has DNS hostnames and DNS support enabled and you enabled private
// DNS names in the preceding steps, you can connect to your VPC endpoint
// by using the standard AWS KMS DNS hostname (https://kms.<region>.amazonaws.com),
// instead of manually configuring the endpoints in the AWS CLI or AWS SDKs.
// The AWS CLI and SDKs use this hostname by default to connect to KMS,
// so there’s nothing to change in your application to begin using the VPC endpoint.
const kmsClient = new AWS.KMS({ region: 'eu-central-1' });

const decrypted = {};

// Decrypt code should run once and variables stored outside of the
// function handler so that these are decrypted once per container
module.exports.decryptEncoded = async (encoded) => {
  if (!decrypted.hasOwnProperty(encoded)) {
    const data = await kmsClient.decrypt({
      CiphertextBlob: Buffer.from(encoded, 'base64')
    }).promise();
    decrypted[encoded] = data.Plaintext.toString('utf-8');
  }
  return decrypted[encoded];
}

module.exports.encryptToEncoded = (plaintext) => {
  return kmsClient.encrypt({
    KeyId: process.env['KMS_KEY_ID'],
    Plaintext: Buffer.from(plaintext, 'utf-8')
  }).promise().then(data => {
    return data.CiphertextBlob.toString('base64');
  });
}
