import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "./mongo.js";
import { ObjectID } from "mongodb";

const collectionName = "things";

export async function createThing(ad) {
  const database = await getDatabase();
  const event = new Date(Date.now());
  const uuid = uuidv4();
  const thing = { ...ad, uuid: uuid, createdAt: event.toISOString() };
  const { insertedId } = await database
    .collection(collectionName)
    .insertOne(thing);
  return thing;
}

export async function getThings() {
  const database = await getDatabase();
  return await database.collection(collectionName).find({}).toArray();
}

export async function forgetThing(uuid) {
  const database = await getDatabase();
  await database.collection(collectionName).deleteOne({
    uuid: uuid,
  });
}

export async function setThing(uuid, ad) {
  const database = await getDatabase();
  delete ad._id;
  const datagram = { ...ad };
  const thing = await database.collection(collectionName).updateOne(
    { uuid: uuid },
    {
      $set: {
        variables: { ...datagram },
      },
    }
  );
  return thing;
}

export async function getThing(uuid) {
  const database = await getDatabase();
  const thing = await database
    .collection(collectionName)
    .findOne({ uuid: uuid });
  return thing;
}
