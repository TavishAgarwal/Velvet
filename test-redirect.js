const { makeRedirectUri } = require('expo-auth-session');
console.log(makeRedirectUri({ path: '/auth/callback' }));
