const { MongoClient } = require("mongodb");
module.exports = async function connectDatabase({ uri, databaseName }) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const collection = client.db(databaseName).collection("compromissos");
    await collection.createIndex({ dataHorario: 1 });
    return { client, collection };
  } catch (error) {
    await client.close();
    throw error;
  }
};



//