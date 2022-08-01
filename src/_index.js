// importing the dependencies
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import {startDatabase} from './database/mongo.js';
import {getThing, forgetThing, setThing, createThing, getThings} from './database/things.js';

// Use Gearman to provide the stack connector.

//import db from "./models/index.js";

import gearmanode from "gearmanode";

const client = gearmanode.client();

const startStackTime = new Date(Date.now());

// defining the Express app
var agentFlag = true;

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
  const startTime = new Date(Date.now());
  const milliseconds = new Date(Date.now()) - startTime;
  const thingReport = {message:'Factor exchange required', runtime:milliseconds};
  res.send({uuid:null, datagram:false, thing:false, thingReport:thingReport});

  //dev
  //res.send(await getThings());
});

// Thing endpoints

app.get('/thing/', async (req, res) => {
  const startTime = new Date(Date.now());
  const datagram = {subject:'Nothing', nomTo:'agent', nomFrom:true, agentInput:null}
  const thing = await getThing(null, 'agent');
  const milliseconds = new Date(Date.now()) - startTime;
  const thingReport = {runtime:milliseconds};

  callAgent(thing.uuid, "Get thing.");

  res.send({ message: 'Made a new Thing.', datagram:datagram, uuid:thing.uuid, thing:thing, thingReport:thingReport });

});


app.get('/thing/:id', async (req, res) => {
  const startTime = new Date(Date.now());
  const uuid = req.params.id;
  const thing = await getThing(uuid);
  const milliseconds = new Date(Date.now()) - startTime;
  const thingReport = {message: 'Thing got.', runtime:milliseconds};

  callAgent(uuid, "Get.");

  res.send({ datagram:{}, uuid:thing.uuid, thing:thing, thingReport:thingReport })
});

// endpoint to create a new thing
app.post('/thing/', async (req, res) => {
  const startTime = new Date(Date.now());
  const datagram = req.body;
  const thing = await createThing(datagram);
  const milliseconds = new Date(Date.now()) - startTime;
  const thingReport = {message: 'Made a new Thing.',runtime:milliseconds};

  callAgent(thing.uuid, "Post");

  res.send({ datagram:datagram, uuid:thing.uuid, thing:thing, thingReport:thingReport });
});

// endpoints to forget a thing
app.delete('/thing/:id', async (req, res) => {
  const startTime = new Date(Date.now());
  const uuid = req.params.id;
  await forgetThing(uuid);
  res.send({ message: 'Forgot Thing.', id:req.params.id });
});

app.get('/thing/:id/forget', async (req, res) => {
  const startTime = new Date(Date.now());
  await forgetThing(req.params.id);
  const thingReport = {message: 'Requested Thing be forgotten.'};
  res.send({ thingReport:thingReport, thing:{input:req.params.id} });
});

// endpoint to update an id
/*
//Not a stack operation
app.put('/thing/:id', async (req, res) => {
  const datagram = req.body;
  const uuid = req.params.id;
  const thing = await setThing(uuid, datagram);
  res.send({ message: 'Thing updated.',datagram:datagram, uuid:uuid, thing:thing });
});
*/

app.get('/thing/:id/:tokens', async (req, res) => {
  const startTime = new Date(Date.now());
  const id = req.params.id;
  const tokens = req.params.tokens;
  const thing = await getThing(id, tokens);

  const uuid = thing && thing.uuid ? thing.uuid : false;

  const thingReport = {message: 'Requested Agent look at Thing.'};

  callAgent(id, tokens);

  res.send({ datagram:{text:tokens, agentInput:null}, uuid:uuid, thing:thing, thingReport:thingReport })
});

app.get('/:tokens', async (req, res) => {
  const startTime = new Date(Date.now());
  const tokens = req.params.tokens;
  const datagram = {text:tokens, agentInput:null};
  const thing = await getThing(null, tokens);

  const milliseconds = new Date(Date.now()) - startTime;
  const thingReport = {message: 'Read tokens.',runtime:milliseconds};

  callAgent(thing.uuid, tokens);

  res.send({ datagram:datagram, uuid:thing.uuid, thing:thing, thingReport:thingReport })
});

app.post('/:tokens', async (req, res) => {
  const startTime = new Date(Date.now());
  const tokens = req.params.tokens;
console.log(tokens);
  const datagram = {text:tokens, agentInput:null};
  const thing = await getThing(null, tokens);

  const milliseconds = new Date(Date.now()) - startTime;
  const thingReport = {message: 'Read tokens.',runtime:milliseconds};

  callAgent(thing.uuid, tokens);

  if (tokens === 'authenticate') {
if (thing.variables === false) {
thing.variables = {};
}
thing.variables.authenticate = {status:"authenticated", refreshedAt:Date.now()};
  }


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

function callAgent(uuid, agent) {
  console.log("callAgent " + uuid + " " + agent);
var match = false;
/*
  if (discordMessage.mentions.has(bot.user)) {
    console.log("Saw the bot mentioned " + bot.user.id);
    match = true;
  }
*/
  // Add a list of words the bot should be responsive to.
/*
  if (text.toLowerCase().includes("ednabot")) {
    match = true;
  }

  if (text.toLowerCase().includes("edna")) {
    match = true;
  }

  if (text.toLowerCase().includes("control")) {
    match = true;
  }

  if (match == false) {
    return;
  }
*/


  if (agentFlag === false) {return;}
  client.jobServers[0].setOption('exceptions', function(){});
  var datagram = {uuid:uuid, to:agent, agent_input:agent};

  //var arr = { from: from, to: to, subject: subject, agent_input: agent_input };
  var jsonDatagram = JSON.stringify(datagram);
  try {
    var job = client.submitJob("call_agent", jsonDatagram);
  } catch (e) {
    agentFlag = false;
    console.log(e);

    var sms = "quiet";
    var message = "Quietness. Just quietness.";
  }

  if (!job) {console.log("GEARMAN JOB SERVER not available"); return;}

  job.on("workData", function (data) {
    // Uncomment for debugging/testing.
    //    console.log('WORK_DATA >>> ' + data);
  });

  job.on('exception', function(text) { // needs configuration of job server session (JobServer#setOption)
    agentFlag = false;
    console.log('EXCEPTION >>> ' + text);
    client.close();
  })

  job.on("complete", function () {
    // Create a fallback message.
    // Which says 'sms'.
    sms = "sms";
    message = "sms";

    try {
      var thing_report = JSON.parse(job.response);
      var sms = thing_report.sms;
      var message = thing_report.message;

    } catch (e) {
      console.log(e);

      var sms = "quiet";
      var message = "Quietness. Just quietness.";
    }

    console.log(sms);
    console.log(message);

    // Respond to the channel with the sms
    // channel response.
    //discordMessage.channel.send(sms);

    // dev exploring ways to respond.
    // discordMessage.reply(sms);
    // message.lineReply(sms); //Line (Inline) Reply with mention
    // message.lineReplyNoMention(`My name is ${client.user.username}`); //L
  });

  job.on('error', function() {
    console.log('ERROR >>> ' + job.handle);
    agentFlag = false;
    client.close();
  });


  job.on('failed', function() {
    console.log('FAILURE >>> ' + job.handle);
    client.close();
  });

}

