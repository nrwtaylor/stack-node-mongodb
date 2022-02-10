// importing the dependencies
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import {startDatabase} from './database/mongo.js';
import {getThing, forgetThing, setThing, createThing, getThings} from './database/things.js';

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

app.use(express.json());

app.get('/', async (req, res) => {
  res.send(await getThings());
});

// Thing endpoints

app.get('/thing/', async (req, res) => {
  res.send(await getThings());
});


app.get('/thing/:id', async (req, res) => {
  const uuid = req.params.id;
  const thing = await getThing(uuid);
  res.send({ message: 'Thing got.', thing:thing })
});

// endpoint to create a new thing
app.post('/thing/', async (req, res) => {
  const datagram = req.body;
  const thing = await createThing(datagram);
  res.send({ message: 'Made a new Thing.', datagram:datagram, uuid:thing.uuid, thing:thing });
});

// endpoints to forget a thing
app.delete('/thing/:id', async (req, res) => {
  const uuid = req.params.id;
  await forgetThing(uuid);
  res.send({ message: 'Forgot Thing.', id:req.params.id });
});

app.get('/thing/:id/forget', async (req, res) => {
  await forgetThing(req.params.id);
  res.send({ message: 'Requested Thing be forgotten.', id:req.params.id });
});

// endpoint to update an ad
app.put('/thing/:id', async (req, res) => {
  const datagram = req.body;
  const uuid = req.params.id;
  const thing = await setThing(uuid, datagram);
  res.send({ message: 'Thing updated.',datagram:datagram, uuid:uuid, thing:thing });
});

// start the in-memory MongoDB instance
startDatabase().then(async () => {
  await createThing({title: 'Node instance started.'});

  // start the server
  app.listen(3001, async () => {
    console.log('listening on port 3001');
  });
});
