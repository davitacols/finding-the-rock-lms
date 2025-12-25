const AWS = require('aws-sdk');
require('dotenv').config({ path: '../.env' });

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const cognito = new AWS.CognitoIdentityServiceProvider();

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const params = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: 'test@example.com',
      TemporaryPassword: 'TempPass123!',
      UserAttributes: [
        { Name: 'email', Value: 'test@example.com' },
        { Name: 'given_name', Value: 'Test' },
        { Name: 'family_name', Value: 'User' },
        { Name: 'email_verified', Value: 'true' }
      ],
      MessageAction: 'SUPPRESS'
    };

    const result = await cognito.adminCreateUser(params).promise();
    console.log('✅ Test user created:', result.User.Username);
    
    // Set permanent password
    const setPasswordParams = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: 'test@example.com',
      Password: 'TestPass123!',
      Permanent: true
    };
    
    await cognito.adminSetUserPassword(setPasswordParams).promise();
    console.log('✅ Password set to: TestPass123!');
    
    console.log('\nTest credentials:');
    console.log('Email: test@example.com');
    console.log('Password: TestPass123!');
    
  } catch (error) {
    if (error.code === 'UsernameExistsException') {
      console.log('✅ Test user already exists');
      console.log('Email: test@example.com');
      console.log('Password: TestPass123!');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

createTestUser();