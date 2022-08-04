import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "./mongo.js";
import { ObjectID } from "mongodb";

const collectionName = "things";

export async function createThing(ad) {

  const database = await getDatabase();
  const event = new Date(Date.now());
  const uuid = uuidv4();

  const nomFrom = null; // De-reference 
  const nomTo = 'agent';

  const associations = [uuid];
  const variables = false;

  const thing = { input:ad, uuid: uuid, associations: associations, nomFrom:nomFrom, nomTo:nomTo, createdAt: event.toISOString(), variables:variables };
  const { insertedId } = await database
    .collection(collectionName)
    .insertOne(thing);

  delete thing._id;

  return thing;
}

export async function getThings(from =  null) {
  const database = await getDatabase();
  const things = await database.collection(collectionName).find({ nomTo: 'agent' }).toArray();
const conditionedThings = things.map((thing)=>{

  delete thing._id;
  return thing;


});

return conditionedThings;


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
  delete thing._id;
  return thing;
}

export async function getThing(uuid, input) {

  if (uuid === null) {
    const thing = await createThing(input);
  delete thing._id;
  return thing;

  }

  const database = await getDatabase();
  const thing = await database
    .collection(collectionName)
    .findOne({ uuid: uuid });

  if (thing === null) {

//return await createThing(input);
//  const thing = await createThing(input);
//  delete thing._id;

//  return thing;
return false;

}

  // If this comes back without a uuid, then create it here.
  delete thing._id;

  return thing;
}
