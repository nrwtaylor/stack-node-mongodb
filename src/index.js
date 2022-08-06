import express from "express";

import cors from "cors";

import dbConfig from "./config/db.config.js";
import bodyParser from "body-parser";

import 'dotenv/config';

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


// this is a trivial implementation
app.use((err, req, res, next) => {
  // you can error out to stderr still, or not; your choice
  console.error(err); 

  // body-parser will set this to 400 if the json is in error
  if(err.status === 400)
  //  return res.status(err.status).send('Dude, you messed up the JSON');
  return res.status(err.status).json({ message: "Malformed JSON request." });

  return next(err); // if it's not a 400, let the default error handling do it. 
});




import authRoutes from './routes/auth.routes.js';
authRoutes(app);

import userRoutes from './routes/user.routes.js';
userRoutes(app);

import thingRoutes from './routes/thing.routes.js';
thingRoutes(app);


import db from "./models/index.js";
const Role = db.role;
db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });



// simple route
app.get("/", (req, res) => {
  res.json({ message: "Stack authenticator." });
});
// set port, listen for requests
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Stack authenticator is running on port ${PORT}.`);
});




function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'user' to roles collection");
      });
      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'moderator' to roles collection");
      });
      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'admin' to roles collection");
      });
    }
  });
}
