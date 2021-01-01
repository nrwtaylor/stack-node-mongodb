// ./src/index.js

// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const {startDatabase} = require('./database/mongo');
const {deleteThing, updateThing, insertThing, getThings} = require('./database/things');

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

app.get('/', async (req, res) => {
  res.send(await getThings());
});

// Thing endpoints

app.get('/thing/', async (req, res) => {
  res.send(await getThings());
});

//app.get('/thing/:id', async (req, res) => {
//  res.send(await getThing());
//});

app.post('/thing/', async (req, res) => {
  const newThing = req.body;
  await insertThing(newThing);
  res.send({ message: 'New thing inserted.' });
});

// endpoint to delete an ad
app.delete('/thing/:id', async (req, res) => {
  await deleteThing(req.params.id);
  res.send({ message: 'Thing removed.' });
});

// endpoint to update an ad
app.put('/thing/:id', async (req, res) => {
  const updatedThing = req.body;
  await updateThing(req.params.id, updatedThing);
  res.send({ message: 'Thing updated.' });
});

// start the in-memory MongoDB instance
startDatabase().then(async () => {
  await insertThing({title: 'Node instance started.'});

  // start the server
  app.listen(3001, async () => {
    console.log('listening on port 3001');
  });
});
