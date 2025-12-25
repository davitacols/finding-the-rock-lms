import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Course: a
    .model({
      title: a.string().required(),
      description: a.string(),
      duration: a.string(),
      isActive: a.boolean().default(true),
    })
    .authorization((allow) => [allow.publicApiKey()]),
    
  User: a
    .model({
      email: a.string().required(),
      firstName: a.string(),
      lastName: a.string(),
      role: a.string().default('student'),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});