/*
Daniel Heyman
I pledge my honor that I have abided by the Stevens Honor System
*/
const app = require('express')();
const http = require('http').Server(app);
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const configRoutes = require("./routes");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser')();
const expressSession = require('express-session')({ secret: 'mysessionpass', resave: false, saveUninitialized: false });
const nrpSender = require("./redis/nrp-sender-shim");

async function sendMessage(message) {
  try {
    return await nrpSender.sendMessage(message);
  } catch(e) {
    console.log(`Worker error: ${e}`);
    return null;
  }
}
global.sendMessage = sendMessage;

passport.use(new LocalStrategy(
  async (username, password, done) => {
    const user = await sendMessage({
      eventName: "users-auth",
      data: { username, password }
    });

    if (user) {
      return done(null, user);
    }
    done(null, false);
  }
));

passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser(async (id, cb) => {
  const user = await sendMessage({
    eventName: "users-getById",
    data: id
  });
  return cb(null, user);
});

app.use(cookieParser);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    // Allow cross origin for app
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
// app.use(function (req, res, next) {
//   console.log(req.user);
//   next()
// })

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json(req.user._id);
});

app.post('/logout', (req, res) => {
  if (req.user) {
    req.logout();
  }
  res.json({});
});

configRoutes(app);

http.listen(3001, () => {
  console.log("API is running on http://localhost:3001");
})
