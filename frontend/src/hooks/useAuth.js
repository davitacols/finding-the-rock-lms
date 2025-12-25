import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAuthSession, signIn, signUp, confirmSignUp, signOut, getCurrentUser } from 'aws-amplify/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(email, password) {
    try {
      const user = await signIn({ username: email, password });
      setUser(user);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Sign in failed';
      
      if (error.name === 'UserNotConfirmedException') {
        errorMessage = 'Please confirm your email address first';
      } else if (error.name === 'NotAuthorizedException') {
        errorMessage = 'Invalid email or password';
      } else if (error.name === 'UserNotFoundException') {
        errorMessage = 'User does not exist. Please sign up first.';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  async function handleSignUp(email, password, firstName, lastName) {
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            given_name: firstName,
            family_name: lastName,
          }
        }
      });
      return { success: true };
    } catch (error) {
      let errorMessage = 'Account creation failed';
      
      if (error.name === 'UsernameExistsException') {
        errorMessage = 'An account with this email already exists';
      } else if (error.name === 'InvalidPasswordException') {
        errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, and numbers';
      } else if (error.name === 'InvalidParameterException') {
        errorMessage = 'Please check your email format and try again';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  async function handleConfirmSignUp(email, code) {
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      return { success: true };
    } catch (error) {
      let errorMessage = 'Confirmation failed';
      
      if (error.name === 'CodeMismatchException') {
        errorMessage = 'Invalid confirmation code. Please try again.';
      } else if (error.name === 'ExpiredCodeException') {
        errorMessage = 'Confirmation code has expired. Please request a new one.';
      } else if (error.name === 'NotAuthorizedException') {
        errorMessage = 'User is already confirmed';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  }

  const value = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}