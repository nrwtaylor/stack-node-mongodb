import {MongoMemoryServer} from 'mongodb-memory-server';
import {MongoClient} from 'mongodb';

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

export async function startDatabase() {
  const connection = await MongoClient.connect(url, {useNewUrlParser: true});
  database = connection.db();
}


export async function getDatabase() {
  if (!database) await startDatabase();
  return database;
}
