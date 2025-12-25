import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    givenName: {
      required: true,
    },
    familyName: {
      required: true,
    },
  },
});