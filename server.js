
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Microsoft OAuth2.0の設定
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: "http://0.0.0.0:5000/auth/microsoft/callback",
  scope: ['user.read']
}, function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));

app.use(passport.initialize());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/auth/microsoft', passport.authenticate('microsoft'));

app.get('/auth/microsoft/callback', 
  passport.authenticate('microsoft', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

io.on('connection', (socket) => {
  console.log('ユーザーが接続しました');
  socket.on('disconnect', () => {
    console.log('ユーザーが切断しました');
  });

  socket.on('chat message', (msg, room) => {
    io.to(room).emit('chat message', msg);
  });
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`サーバーがポート ${PORT} で待機中です`);
});
```
