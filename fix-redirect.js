const { makeRedirectUri } = require('expo-auth-session');
console.log('Without scheme:', makeRedirectUri({ path: '/auth/callback' }));
console.log('With scheme:', makeRedirectUri({ scheme: 'velvet', path: '/auth/callback' }));
