const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new SteamStrategy({
  returnURL: 'http://localhost:3001/auth/steam/return',  // Backend route for Steam callback
  realm: 'http://localhost:3001/',  // Base URL of the server
  apiKey: '4E939ADE77A0CC0D666935FBB919EB34'  // Replace with your Steam API key
}, function (identifier, profile, done) {
  return done(null, profile);
}));
