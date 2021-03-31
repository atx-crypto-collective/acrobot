import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = `mongodb+srv://admin:${process.env.MONGO_DB_PASSWORD}@cluster0.qq6rw.mongodb.net?retryWrites=true&w=majority`;

const mongoDBClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export interface Definition {
  item: string;
  definition: string;
}

export async function getDefinition(item: string): Promise<Definition | undefined> {
  try {
    await mongoDBClient.connect();

    const database = mongoDBClient.db('acrobot');
    const definitions = database.collection('definitions');

    // TODO: we should decide what to do with acronyms that have >1 definition
    // For SPOCS, gonna keep it simple and just encourage people to add both definitions to the item
    return definitions.findOne({ item });
  } catch (error) {
    console.log(error);
  }
}

export async function upsertDefinition() {
  try {
    await mongoDBClient.connect();

    const database = mongoDBClient.db('acrobot');
    const definitions = database.collection('definitions');

    // add new definition to mongodb
  } catch (error) {
    console.log(error);
  }
}

