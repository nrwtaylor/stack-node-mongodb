// importing the dependencies
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import {startDatabase} from './database/mongo.js';
import {getThing, forgetThing, setThing, createThing, getThings} from './database/things.js';

//  var milliseconds = new Date(endTime) - new Date(startTime);
const startTime = new Date(Date.now());

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
  const milliseconds = new Date(Date.now()) - startTime;
  const thingReport = {message:'Factor exchange required', runtime:milliseconds};
  res.send({uuid:null, datagram:false, thing:false, thingReport:thingReport});

  //dev
  //res.send(await getThings());
});

// Thing endpoints

app.get('/thing/', async (req, res) => {

  const datagram = {subject:'Nothing', nomTo:'agent', nomFrom:true, agentInput:null}
  const thing = await getThing(null, 'agent');
  const milliseconds = new Date(Date.now()) - startTime;
  const thingReport = {runtime:milliseconds};

  res.send({ message: 'Made a new Thing.', datagram:datagram, uuid:thing.uuid, thing:thing, thingReport:thingReport });

});


app.get('/thing/:id', async (req, res) => {
  const uuid = req.params.id;
  const thing = await getThing(uuid);
  const milliseconds = new Date(Date.now()) - startTime;
  const thingReport = {message: 'Thing got.', runtime:milliseconds};
  res.send({ datagram:{}, uuid:thing.uuid, thing:thing, thingReport:thingReport })
});

// endpoint to create a new thing
app.post('/thing/', async (req, res) => {
  const datagram = req.body;
  const thing = await createThing(datagram);
  const milliseconds = new Date(Date.now()) - startTime;
  const thingReport = {message: 'Made a new Thing.',runtime:milliseconds};

  res.send({ datagram:datagram, uuid:thing.uuid, thing:thing, thingReport:thingReport });
});

// endpoints to forget a thing
app.delete('/thing/:id', async (req, res) => {
  const uuid = req.params.id;
  await forgetThing(uuid);
  res.send({ message: 'Forgot Thing.', id:req.params.id });
});

app.get('/thing/:id/forget', async (req, res) => {
  await forgetThing(req.params.id);
  const thingReport = {message: 'Requested Thing be forgotten.'};
  res.send({ thingReport:thingReport, thing:{input:req.params.id} });
});

// endpoint to update an ad
app.put('/thing/:id', async (req, res) => {
  const datagram = req.body;
  const uuid = req.params.id;
  const thing = await setThing(uuid, datagram);
  res.send({ message: 'Thing updated.',datagram:datagram, uuid:uuid, thing:thing });
});

app.get('/thing/:id/:tokens', async (req, res) => {
  const id = req.params.id;
  const tokens = req.params.tokens;
  const thing = await getThing(id, tokens);
  res.send({ message: 'Read tokens.', datagram:{text:tokens, agentInput:null}, thing:thing })
});

app.get('/:tokens', async (req, res) => {
  const tokens = req.params.tokens;
  const datagram = {text:tokens, agentInput:null};
  const thing = await getThing(null, tokens);

  const milliseconds = new Date(Date.now()) - startTime;
  const thingReport = {message: 'Read tokens.',runtime:milliseconds};

  res.send({ datagram:datagram, uuid:thing.uuid, thing:thing, thingReport:thingReport })
});

// start the in-memory MongoDB instance
startDatabase().then(async () => {
  await createThing({title: 'Node instance started.'});

  // start the server
  app.listen(3001, async () => {
    console.log('listening on port 3001');
  });
});
