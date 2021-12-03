import * as express from 'express';
import * as session from 'express-session';
import * as passport from 'passport';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import { Strategy } from 'passport-local';
import { FileDB } from '@gsbelarus/util-helpers';

const MemoryStore = require('memorystore')(session);

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

interface IUser {
  userName: string;
  hash: string;
  salt: string;
};

const userDB = new FileDB<IUser>({
  fn: `${process.env.DB_FOLDER}/user.json`
});

const userName2Key = (userName: string) => userName.toLowerCase();

passport.use(new Strategy(
  async (userName: string, password: string, cb) => {
    try {
      const user = await userDB.read(userName2Key(userName));

      if (!user) {
        return cb(null, false);
      }

      if (validPassword(password, user.hash, user.salt)) {
        return cb(null, user);
      } else {
        return cb(null, false);
      }
    }
    catch(err) {
      cb(err);
    }
  }
));

passport.serializeUser( (user: IUser, cb) => cb(null, userName2Key(user.userName)) );

passport.deserializeUser( async (id: string, cb) => {
  const user = await userDB.read(id);

  if (user) {
    cb(null, user);
  } else {
    cb(`Unknown user id ${id}`);
  }
});

const sessionStore = new MemoryStore({ checkPeriod: 24 * 60 * 60 * 1000 });

app.use(session({
  secret: 'kjdsfgfghfghfghfghfghfghhf',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: { maxAge: 30 * 1000 },
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (_, res) => {
  res.send('<h1>Home</h1><p>Please <a href="/register">register</a></p>');
});

app.get('/api', (_, res) => {
  res.send({ message: 'Welcome to gdmn-nxt-server!' });
});

app.get('/login', (_, res) => {
  const form = '<h1>Login Page</h1><form method="POST" action="/login">\
  Enter Username:<br><input type="text" name="username">\
  <br>Enter Password:<br><input type="password" name="password">\
  <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

app.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login-failure',
    successRedirect: 'login-success' }),
  (err, req, res, next) => {
    if (err) next(err);
  }
);

app.get('/register', (_, res) => {
  const form = '<h1>Register Page</h1><form method="post" action="register">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

app.post('/register', async (req, res) => {
  const userName = req.body.username;

  const newUser: IUser = {
    userName,
    ...genPassword(req.body.password)
  };

  await userDB.write(userName2Key(userName), newUser, true);

  res.redirect('/login');
});

app.get('/protected-route', (req, res) => {
  // This is how you check if a user is authenticated and protect a route.  You could turn this into a custom middleware to make it less redundant
  if (req.isAuthenticated()) {
      res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
  } else {
      res.send('<h1>You are not authenticated</h1><p><a href="/login">Login</a></p>');
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/protected-route');
});

app.get('/login-success', (_, res) => {
  res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
});

app.get('/login-failure', (_, res) => {
  res.send('You entered the wrong password.');
});

const port = process.env.SERVER_PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

process
  .on('exit', code => console.log(`Process exit event with code: ${code}`) )
  .on('SIGINT', async () => {
    userDB.flush();
    process.exit();
  })
  .on('SIGTERM', async () => {
    userDB.flush();
    process.exit();
  })
  .on('unhandledRejection', (reason, p) => console.error({ err: reason }, p) )
  .on('uncaughtException', err => console.error(err) );

/**
 * -------------- HELPER FUNCTIONS ----------------
 */

/**
 *
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword(password: string, hash: string, salt: string) {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
};

function genPassword(password: string) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
};
