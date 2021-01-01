// ./src/database/ads.js
const {getDatabase} = require('./mongo');
const {ObjectID} = require('mongodb');

const collectionName = 'things';

async function insertThing(ad) {
  const database = await getDatabase();
  const {insertedId} = await database.collection(collectionName).insertOne(ad);
  return insertedId;
}

async function getThings() {
  const database = await getDatabase();
  return await database.collection(collectionName).find({}).toArray();
}

async function deleteThing(id) {
  const database = await getDatabase();
  await database.collection(collectionName).deleteOne({
    _id: new ObjectID(id),
  });
}

async function updateThing(id, ad) {
  const database = await getDatabase();
  delete ad._id;
  await database.collection(collectionName).update(
    { _id: new ObjectID(id), },
    {
      $set: {
        ...ad,
      },
    },
  );
}

module.exports = {
  insertThing,
  getThings,
  deleteThing,
  updateThing,
};
