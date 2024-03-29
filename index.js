/*
    Parker
    Will Koelliker, Grant Gwin, Joseph Fuge
*/

import express from "express";
import { fileURLToPath } from 'url';
const app = express();
app.use(express.urlencoded({extended: true}));

import {join, dirname} from "path";
import config from './dbConfig.json' assert { type: 'json' };
const PORT_NUM = process.env.PORT || 3000;

import {v4 as uuid} from 'uuid';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cookieParser());

import knex from 'knex';
const db = knex({
  client: "pg",
  connection: {
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
    ssl: false //true ? {rejectUnauthorized: false} : false
  }
});

app.get("/index", (req, res) => {
   res.render("index");
});

// Frontend static middleware
app.use(express.static(join(__dirname, 'public')));

app.use(express.json());

app.use('/map', checkAuth);

app.set("view engine", "ejs");

app.use(express.json());

app.get("/map", async (req, res) => {
  res.render("map");
});

app.get("/auth/map", async (req, res) => {
  res.render("map");
});

app.get("/", (req, res) => {
  res.render("map");
});

app.get("/login", (req, res) => {
  res.render("login");
});

// API listener middleware
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

// Check user login auth middleware
async function checkAuth (req, res, next) {
  try {
    authToken = req.cookies['token'];
    const user = await getUserByToken(authToken);
    if (user) {
      next();
    } else {
      res.render('unauth');
    }
  } catch (error) {
    res.render('unauth');
  }
}

apiRouter.post('/login', async (req, res) => {
  const user = await getUser(req.body.email == undefined ? 'test`' : req.body.email);
  if (user) {
    try {
      if (await bcrypt.compare(req.body.password, user.Password)) {
        setAuthCookie(res, user.AuthToken);
        res.send({ email: user.Username });
        return;
      }
    } catch (error) {
      res.status(401).send({ message: 'Invalid password'});
      return;
    } 
  }
  res.status(401).send({ message: 'Invalid email or password' });
});

const secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use('/api/auth', checkAuth);

async function getUserByToken(authToken) {
  const resultUser = await db('AuthInfo').select().where('AuthToken', authToken);
  return resultUser[0];
}

function setAuthCookie(res, authToken) {
  res.cookie('token', authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    path: '/'
  });
}

async function getUser(username) {
  const userResult = await db('AuthInfo').select().where('Email', username);

  return userResult[0];
}

async function createUserAuth(username, password, firstName, lastName, venmo, phoneNumber) {
  const passwordHash = await bcrypt.hash(password, 10);

  const host = {
    FirstName: firstName,
    LastName: lastName,
    PhoneNumber: phoneNumber,
  };

  const userAuth = await db('Hosts').insert(host).returning('HostID');

  if (userAuth[0] && userAuth[0]['HostID']) {
    const auth = {
      HostID: parseInt(userAuth[0]['HostID']),
      Email: username,
      Password: passwordHash,
      AuthToken: uuid(),
    };

    await db.into('AuthInfo').insert(auth);

    const payInfo = {
      UserID: parseInt(userAuth[0]['HostID']),
      Venmo: venmo,
    };

    await db.into('PaymentInfo').insert(payInfo);
    
    return auth;
  }

  return undefined;
}

apiRouter.post('/createUser', async (req, res) => {
  if (await getUser(req.body.username)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    let user = await createUserAuth(req.body.username, req.body.password, req.body.firstName, req.body.lastName, req.body.venmo, req.body.phoneNumber);
    
    if (user == undefined) {
      user = {Username: undefined};
    }

    res.send({
      username: user.Username,
    });
  }
});

apiRouter.delete('/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.status(204).end();
});

app.get('/user/me', async (req, res) => {
  const authToken = req.cookies['token'];
  const user = getUserByToken(authToken);
  if (user[0]) {
    res.send({ username: user[0].Username });
    return;
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// apiRouter.post("/auth/deleteUser", async (req, res) => { 
//   await db("AuthInfo").where("Email", req.body['username']).del()
//   res.status(200)
// });

apiRouter.delete('/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.status(204).end();
});

app.listen(PORT_NUM, () => console.log(`Server is listening on port ${PORT_NUM}`));