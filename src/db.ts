import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = `mongodb+srv://admin:${process.env.MONGO_DB_PASSWORD}@cluster0.qq6rw.mongodb.net?retryWrites=true&w=majority`;

const mongoDBClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export async function getDefinition() {
  try {
    await mongoDBClient.connect();

    const database = mongoDBClient.db('acrobot');
    const definitions = database.collection('definitions');

    return definitions.findOne({
      // should not be hardcoded
      item: 'LP',
    });
  } catch (error) {
    console.log(error);
  }
}

export async function addDefinition() {
  try {
    await mongoDBClient.connect();

    const database = mongoDBClient.db('acrobot');
    const definitions = database.collection('definitions');

    // add new definition to mongodb
  } catch (error) {
    console.log(error);
  }
}
