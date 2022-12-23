import { authJwt } from "../middleware/authJwt.js";
import {
  allAccess,
  moderatorBoard,
  userBoard,
  adminBoard,
} from "../controllers/user.controller.js";

import { startDatabase } from "../database/mongo.js";
import {
  getThing,
  forgetThing,
  setThing,
  createThing,
  getThings,
} from "..//database/things.js";

export const thingRoutes = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );



res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
res.setHeader('Access-Control-Allow-Credentials', true);

    next();
  });

  app.get("/", [authJwt.verifyToken], async (req, res) => {
    const startTime = new Date(Date.now());
    const milliseconds = new Date(Date.now()) - startTime;
    const thingReport = {
      message: "Token authenticated.",
      runtime: milliseconds,
    };
    res.send({
      uuid: null,
      datagram: false,
      thing: false,
      thingReport: thingReport,
    });

    //dev
    //res.send(await getThings());
  });

  app.get("/things/", async (req, res) => {
  // app.get("/things/", [authJwt.verifyToken], async (req, res) => {
    const startTime = new Date(Date.now());
    const milliseconds = new Date(Date.now()) - startTime;
    const thingReport = {
      message: "Token authenticated.",
      runtime: milliseconds,
    };

  let token = req.headers["x-access-token"];
const decodedToken = await authJwt.decodeToken(token);

var id = null;
if (decodedToken && decodedToken.id) {
id = decodedToken.id;
}

//const id = getId(req);

const response = await getThings(id);

console.log("stack-node-mongodb ", "/things/ id ", id ,"response", response);


    res.send({
      uuid: null,
      datagram: false,
//      thing: false,
      thingReport: thingReport,
things:response,
id:id,
    });

    //dev
    //res.send(await getThings());
  });


  app.post("/things/", async (req, res) => {
  // app.get("/things/", [authJwt.verifyToken], async (req, res) => {
    const startTime = new Date(Date.now());
    const milliseconds = new Date(Date.now()) - startTime;

    const datagram = req.body;

    const thingReport = {
      message: "Token authenticated.",
      runtime: milliseconds,
    };

  let token = req.headers["x-access-token"];
const decodedToken = await authJwt.decodeToken(token);

var id = null;
if (decodedToken && decodedToken.id) {
id = decodedToken.id;
}

//const id = getId(req);

const search = {...datagram.agentInput, nomFrom:id};

const response = await getThings(search);

console.log("stack-node-mongodb ", "POST /things/ id ", id ,"response", response, "search", search);


    res.send({
      uuid: null,
      datagram: false,
//      thing: false,
      thingReport: thingReport,
things:response,
id:id,
    });

    //dev
    //res.send(await getThings());
  });




  // endpoint to create a new thing
  app.post("/thing/", [authJwt.verifyToken], async (req, res) => {
    const startTime = new Date(Date.now());
    const datagram = req.body;




//    const thing = await createThing(datagram);
//    const milliseconds = new Date(Date.now()) - startTime;
//    const thingReport = { message: "Made a new Thing.", runtime: milliseconds };

    //  callAgent(thing.uuid, "Post");

  let token = req.headers["x-access-token"];
const decodedToken = await authJwt.decodeToken(token);

var id = null;
if (decodedToken && decodedToken.id) {
id = decodedToken.id;
}

datagram.from = id;
datagram.nomFrom = id;

if (!datagram.nomTo) {datagram.nomTo = datagram.to;}

    const thing = await createThing(datagram);
    const milliseconds = new Date(Date.now()) - startTime;
    const thingReport = { message: "Made a new Thing.", runtime: milliseconds };



console.log("stack-node-mongodb id",id, "/thing/ datagram received", datagram.subject);
    res.send({
      datagram: datagram,
      uuid: thing.uuid,
      thing: thing,
      thingReport: thingReport,
    });
  });

  app.get("/thing/:id", [authJwt.verifyToken], async (req, res) => {
    const startTime = new Date(Date.now());
    const uuid = req.params.id;
    const thing = await getThing(uuid);
    const milliseconds = new Date(Date.now()) - startTime;
    const thingReport = { message: "Thing got.", runtime: milliseconds };

    callAgent(uuid, "Get.");

    res.send({
      datagram: {},
      uuid: thing.uuid,
      thing: thing,
      thingReport: thingReport,
    });
  });

  // endpoints to forget a thing
  app.delete("/thing/:id", [authJwt.verifyToken], async (req, res) => {
    const startTime = new Date(Date.now());
    const uuid = req.params.id;
    await forgetThing(uuid);
    res.send({ message: "Forgot Thing.", id: req.params.id });
  });

  app.get("/thing/:id/forget", [authJwt.verifyToken], async (req, res) => {
    const startTime = new Date(Date.now());
    await forgetThing(req.params.id);
    const thingReport = { message: "Requested Thing be forgotten." };
    res.send({ thingReport: thingReport, thing: { input: req.params.id } });
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

  app.get("/thing/:id/:tokens", [authJwt.verifyToken], async (req, res) => {
    const startTime = new Date(Date.now());
    const id = req.params.id;
    const tokens = req.params.tokens;
    const thing = await getThing(id, tokens);

    const uuid = thing && thing.uuid ? thing.uuid : false;

    const thingReport = { message: "Requested Agent look at Thing." };

    callAgent(id, tokens);

    res.send({
      datagram: { text: tokens, agentInput: null },
      uuid: uuid,
      thing: thing,
      thingReport: thingReport,
    });
  });

  app.get("/:tokens", [authJwt.verifyToken], async (req, res) => {
    const startTime = new Date(Date.now());
    const tokens = req.params.tokens;
    const datagram = { text: tokens, agentInput: null };
    const thing = await getThing(null, tokens);

    const milliseconds = new Date(Date.now()) - startTime;
    const thingReport = { message: "Read tokens.", runtime: milliseconds };

    callAgent(thing.uuid, tokens);

    res.send({
      datagram: datagram,
      uuid: thing.uuid,
      thing: thing,
      thingReport: thingReport,
    });
  });

  app.post("/:tokens", [authJwt.verifyToken], async (req, res) => {
    const startTime = new Date(Date.now());
    const tokens = req.params.tokens;
    console.log(tokens);
    const datagram = { text: tokens, agentInput: null };
    const thing = await getThing(null, tokens);

    const milliseconds = new Date(Date.now()) - startTime;
    const thingReport = { message: "Read tokens.", runtime: milliseconds };

    callAgent(thing.uuid, tokens);

    if (tokens === "authenticate") {
      if (thing.variables === false) {
        thing.variables = {};
      }
      thing.variables.authenticate = {
        status: "authenticated",
        refreshedAt: Date.now(),
      };
    }

    res.send({
      datagram: datagram,
      uuid: thing.uuid,
      thing: thing,
      thingReport: thingReport,
    });
  });

  // DEV

  app.get("/api/test/all", allAccess);
  app.get("/api/test/user", [authJwt.verifyToken], userBoard);
  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    moderatorBoard
  );
  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    adminBoard
  );
};

function callAgent(uuid, message) {
  console.log(uuid, message);
}

export default thingRoutes;
