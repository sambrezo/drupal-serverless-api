// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

// Create an SQS service object
const sqsClient = new AWS.SQS({ apiVersion: '2012-11-05', region: 'eu-central-1' });

module.exports.sendMessage = (queueUrl, messageBody, paramsExtra = {}) => {
  return sqsClient.sendMessage({
    QueueUrl: queueUrl,
    MessageBody: messageBody,
    ...paramsExtra
  }).promise().then(data => data.MessageId);
}
