const express = require('express');
const router = express.Router();
const { cognito, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } = require('../config/aws');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    const params = {
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'given_name', Value: firstName },
        { Name: 'family_name', Value: lastName }
      ]
    };

    const result = await cognito.signUp(params).promise();
    
    // Create user record in database
    const db = require('../config/database');
    await db.query(`
      INSERT INTO users (cognito_user_id, email, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, 'student')
    `, [result.UserSub, email, firstName, lastName]);
    
    res.json({ success: true, message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const params = {
      ClientId: COGNITO_CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    };

    const result = await cognito.initiateAuth(params).promise();
    
    // Get user from database
    const db = require('../config/database');
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    
    res.json({ 
      success: true, 
      token: result.AuthenticationResult.AccessToken,
      user: userResult.rows[0] || null
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;