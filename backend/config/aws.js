const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();
const cognito = new AWS.CognitoIdentityServiceProvider();
const mediaConvert = new AWS.MediaConvert({
  endpoint: process.env.MEDIACONVERT_ENDPOINT
});

module.exports = {
  s3,
  cognito,
  mediaConvert,
  S3_BUCKET: process.env.S3_BUCKET_NAME,
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID
};