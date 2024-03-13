import express, { Request } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { validPassword } from '@gsbelarus/util-helpers';
import { Permissions } from '@gsbelarus/util-api-types';
import { checkGedeminUser, getAccount, getGedeminUser } from './app/controllers/app';
import { upsertAccount, getAccounts } from './app/controllers/accounts';
import contactGroups from './app/controllers/contactGrops';
import departments from './app/controllers/departments';
import bankStatementsRouter from './app/routes/bankStatementsRouter';
import customerContracts from './app/controllers/customerContracts';
import kanbanRouter from './app/routes/kanbanRouter';
import actCompletionRouter from './app/routes/actCompletionRouter';
import chartsRouter from './app/routes/chartsDataRouter';
import contactsRouter from './app/routes/contactsRouter';
import systemRouter from './app/routes/systemRouter';
import { disposeConnection } from '@gdmn-nxt/db-connection';
import { importedModels } from './app/utils/models';
import contractsListRouter from './app/routes/contractsRouter';
import reportsRouter from './app/routes/reportsRouter';
import workTypes from './app/controllers/workTypes';
import labelsRouter from './app/routes/labelsRouter';
import { permissionsRouter } from './app/routes/permissionsRouter';
import businessProcessRouter from './app/routes/businessProcess';
import profileSettingsRouter from './app/routes/settings/profileSettings';
import faqRouter from './app/routes/faqRouter';
import updatesRouter from './app/routes/updatesRouter';
import cookieParser from 'cookie-parser';
import RateLimit from 'express-rate-limit';
import { Notifications } from './app/routes/socket/notifications';
import { StreamingUpdate } from './app/routes/socket/streamingUpdate';
import { config } from '@gdmn-nxt/config';
import { checkPermissions, setPermissonsCache } from './app/middlewares/permissions';
import { authRouter } from './app/routes/authRouter';
import path from 'path';
import flash from 'connect-flash';
import { errorMiddleware } from './app/middlewares/errors';
import { jwtMiddleware } from './app/middlewares/jwt';
import { csrf } from 'lusca';
import { bodySize } from './app/constants/params';
import { cacheManager } from '@gdmn-nxt/cache-manager';
import { cachedRequets } from './app/utils/cached requests';
import fs from 'fs';
import https, { ServerOptions } from 'https';
import systemSettingsRouter from './app/routes/settings/systemSettings';

/** Расширенный интерфейс для сессии */
declare module 'express-session' {
  interface SessionData {
    userId: number;
    permissions: Permissions;
    qr: string;
    base32Secret: string;
    token: string;
    email: string;
    userName: string;
    captcha: string;
  }
}

interface IBaseUser {
  userName: string;
};

interface IGedeminUser extends IBaseUser {
  gedeminUser: true;
};

interface ICustomerUser extends IBaseUser {
  email: string;
  hash: string;
  salt: string;
  expireOn?: number;
};

type IUser = IGedeminUser | ICustomerUser;

/** Local cache initialization */
cacheManager.init({ useClones: false });

/** Cache all necessary data */
cachedRequets.init(cacheManager);
/** Refresh cache every 20 minutes */
setInterval(() => cachedRequets.init(cacheManager), 20 * 60 * 1000);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MemoryStore = require('memorystore')(session);

const app = express();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors');

app.use(cors({
  credentials: true,
  secure: 'httpOnly',
  origin: config.origin
}));

if (config.serverStaticMode) {
  app.use(express.static(path.resolve(__dirname, '../gdmn-nxt-web')));
}
app.use(express.json({ limit: bodySize }));
app.use(express.urlencoded({ extended: true }));
const apiRoot = {
  v1: '/api/v1',
  v2: '/api/v2'
};

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100
});
app.use(limiter);


function isIGedeminUser(u: IUser): u is IGedeminUser {
  // eslint-disable-next-line dot-notation
  return !!u['gedeminUser'];
};

const userName2Key = (userName: string) => userName.toLowerCase();

passport.use(new Strategy({
  usernameField: 'userName',
  passwordField: 'password',
  passReqToCallback: true
},
async (req: Request, userName: string, password: string, done) => {
  const { employeeMode } = req.body;
  try {
    if (employeeMode) {
      const res = await checkGedeminUser(userName, password);

      if (res.result === 'UNKNOWN_USER') {
        console.log('Unknown gedemin user', { userName, password });
        return done(null, false, { message: `Неизвестный пользователь: ${userName}` });
      }

      if (res.result === 'SUCCESS') {
        console.log('valid gedemin user');

        const permissions = (await cacheManager.getKey('permissions')) ?? {};
        const userPermissions: Permissions = permissions?.[res.userProfile.id];

        if (!userPermissions) {
          return done(null, false, { message: 'Пользователю ограничен доступ к приложению.' });
        }

        return done(null, {
          userName,
          gedeminUser: true,
          id: res.userProfile.id,
          email: res.userProfile.email,
          permissions: userPermissions
        });
      } else {
        console.log('Invalid gedemin user', { userName, password });
        return done(null, false, { message: 'Неверное имя пользователя или пароль.' });
      }
    } else {
      const account = await getAccount(req.sessionID, userName);

      if (!account || !account.USR$APPROVED || (account.USR$EXPIREON && account.USR$EXPIREON < new Date())) {
        return done(null, false);
      }

      if (validPassword(password, account.USR$HASH, account.USR$SALT)) {
        console.log('valid user');
        return done(null, { userName });
      } else {
        console.log('Invalid user', { userName, password });
        return done(null, false);
      }
    }
  } catch (err) {
    console.error('Passport error:', err);
    done(err);
  }
}
));

passport.serializeUser((user: IUser, done) => {
  // console.log('passport serialize');
  const newUser = { ...user, userName: `${isIGedeminUser(user) ? 'G' : 'U'}${userName2Key(user.userName)}` };
  done(null, newUser);
});

passport.deserializeUser(async (user: IUser, done) => {
  // console.log('passport deserialize');

  const { userName: name } = user;

  const userType = name.slice(0, 1);
  const userName = name.slice(1);

  if (userType === 'U') {
    const account = await getAccount('passport', userName);

    if (account) {
      done(null, { userName });
    } else {
      done(`Unknown user userName: ${userName}`);
    }
  } else {
    const res = await getGedeminUser(userName);

    if (res) {
      done(null, { ...user, ...res, gedeminUser: true });
    } else {
      done(`Unknown user userName: ${userName}`);
    }
  }
});

const sessionStore = new MemoryStore({ checkPeriod: 24 * 60 * 60 * 1000 });

const appMiddlewares = [
  session({
    name: 'Sid',
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: true
      // process.env.NODE_ENV === 'production'
    },
  }),
  cookieParser(),
  passport.initialize(),
  passport.session(),
  flash(),
  errorMiddleware
  // csrf()
];

const routerMiddlewares = [
  jwtMiddleware,
  checkPermissions,
  errorMiddleware
];

const router = express.Router();

export const apiVersion = apiRoot.v1;

router.use(authRouter);
/** Подключаем мидлвар после роутов, на которые он не должен распространятсься */
router.use(routerMiddlewares);

app.use(appMiddlewares);
app.use(apiVersion, router);

/** Write permissions to cache when server is starting */
setPermissonsCache();

/** Streaming updates module */
StreamingUpdate();

/** Notifications module */
Notifications({ router });

/** Contacts */
router.use(contactsRouter);

/** Contact groups */
router.get('/contactgroups', contactGroups.get);
router.post('/contactgroups', contactGroups.add);
router.put('/contactgroups/:id', contactGroups.update);
router.delete('/contactgroups/:id', contactGroups.remove);

/** Departments */
router.get('/departments', departments.get);
router.get('/departments/:id', departments.get);
router.post('/departments', departments.upsert);
router.put('/departments/:id', departments.upsert);
router.delete('/departments/:id', departments.remove);

/** Customer contracts */
router.get('/customercontracts', customerContracts.get);
router.get('/customercontracts/:id', customerContracts.get);
router.post('/customercontracts', customerContracts.upsert);
router.put('/customercontracts/:id', customerContracts.upsert);
router.delete('/customercontracts/:id', customerContracts.remove);

router.get('/worktypes', workTypes.get);
router.get('/worktypes/contractJobKey/:contractJobKeys', workTypes.get);

router.use(businessProcessRouter);

/** Labels*/
router.use(labelsRouter);

/** FAQ*/
router.use(faqRouter);

router.use(updatesRouter);

/** Contracts list */
router.use(contractsListRouter);
/** Bank Statements */
router.use(bankStatementsRouter);

/** Deals */
// router.use(dealsRouter);

/** Kanban */
router.use(kanbanRouter);

router.use(actCompletionRouter);

router.use(chartsRouter);
router.use(systemRouter);

router.use(permissionsRouter);

router.get('/accounts', getAccounts);
router.get('/accounts/email/:email', getAccounts);
router.get('/account/:id', getAccounts);
router.post('/account', upsertAccount);
router.put('/account/:ID', upsertAccount);

router.use(reportsRouter);

/** Settings */
router.use(profileSettingsRouter);
router.use(systemSettingsRouter);

router.get('/er-model', async (_, res) => {
  const { erModelNoAdapters } = await importedModels;
  res.json(erModelNoAdapters);
});

router.get('/er-model/with-adapters', async (_, res) => {
  const { erModel } = await importedModels;
  res.json(erModel);
});

router.get('/er-model/make-sql', async (_, res) => {
  const { erModel } = await importedModels;
  res.json(erModel);
});

if (config.serverStaticMode) {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../gdmn-nxt-web', 'index.html'));
  });
}

app.get('*', (req) => console.log(`Unknown request: ${req.url}`));

const privateKey = fs.readFileSync(path.join(__dirname, '../../../ssl', 'gdmn.app.key'));
const bundle = fs.readFileSync(path.join(__dirname, '../../../ssl', 'gdmn.app.ca-bundle'));
const certificate = fs.readFileSync(path.join(__dirname, '../../../ssl', 'gdmn.app.crt'));

const options: ServerOptions = {
  key: privateKey,
  cert: certificate,
  ca: bundle,
};

const httpsServer = https.createServer(options, app);
httpsServer.listen(config.serverPort, () => console.log(`👀 Server is listening on port [ ${config.serverPort} ]`));
httpsServer.on('[ error ]', console.error);

process
  .on('exit', code => {
    disposeConnection();
    console.log(`Process exit event with code: ${code}`);
  })
  .on('SIGINT', process.exit)
  .on('SIGBREAK', process.exit)
  .on('SIGTERM', process.exit)
  .on('unhandledRejection', (reason, p) => console.error({ err: reason }, p))
  .on('uncaughtException', console.error);
