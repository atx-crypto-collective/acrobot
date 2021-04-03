import { DeleteWriteOpResultObject, MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export interface Definition {
  term: string;
  definition: string;
  lookupCount: number;
}

const uri = process.env.MONGO_DB_URI as string;

const mongoDBClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


export async function getDefinition(
  term: string,
): Promise<Definition | undefined> {
  try {
    await mongoDBClient.connect();
    const database = mongoDBClient.db('acrobot');
    const definitions = database.collection('definitions');

    // TODO: we should decide what to do with acronyms that have >1 definition
    // For SPOCS, gonna keep it simple and just encourage people to add both definitions to the term
    return definitions.findOne({ term });
  } catch (error) {
    console.log(error);
  }
}

export async function incrementLookupCount(term: string): Promise<void> {
  try {
    await mongoDBClient.connect();
    const database = mongoDBClient.db('acrobot');
    const definitions = database.collection('definitions');
    const definition = await definitions.findOne({ term });
    if (!definition) {
      return;
    }

    const { lookupCount } = definition;

    const newLookupCount = lookupCount + 1;

    await definitions.updateOne({ term }, { $set: { lookupCount: newLookupCount } });
  } catch (error) {
    console.log(error);
  }
}

export async function getList(): Promise<Definition[] | undefined> {
  try {
    await mongoDBClient.connect();
    const database = mongoDBClient.db('acrobot');
    const definitions = database.collection('definitions');
    // sort by descending (-1) and get first 50
    const cursor = await definitions.find().sort({ lookupCount: -1 }).limit(50);

    return cursor.toArray();
  } catch (error) {
    console.log(error);
  }
}

export async function upsertDefinition(term: string, definition: string) {
  try {
    await mongoDBClient.connect();
    const database = mongoDBClient.db('acrobot');
    const definitions = database.collection('definitions');
    return definitions.updateOne(
      { term },
      { $set: { term, definition, lookupCount: 0 } },
      { upsert: true },
    );
  } catch (error) {
    console.log(error);
  }
}

export async function deleteDefinition(
  term: string,
): Promise<DeleteWriteOpResultObject | undefined> {
  try {
    await mongoDBClient.connect();
    const database = mongoDBClient.db('acrobot');
    const definitions = database.collection('definitions');
    return definitions.deleteOne({
      term,
    });
  } catch (error) {
    console.log(error);
  }
}
