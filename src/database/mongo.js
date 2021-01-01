// ./src/database/mongo.js
const {MongoMemoryServer} = require('mongodb-memory-server');
const {MongoClient} = require('mongodb');

var url = "mongodb://localhost:27017/stack";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

let database = null;

/*
async function startDatabase() {
  const mongo = new MongoMemoryServer();
  const mongoDBURL = await mongo.getConnectionString();
  const connection = await MongoClient.connect(mongoDBURL, {useNewUrlParser: true});
  database = connection.db();
}
*/

async function startDatabase() {
  const connection = await MongoClient.connect(url, {useNewUrlParser: true});
  database = connection.db();
}


async function getDatabase() {
  if (!database) await startDatabase();
  return database;
}

module.exports = {
  getDatabase,
  startDatabase,
};
