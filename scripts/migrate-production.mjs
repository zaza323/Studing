import mongoose from "mongoose";

const sourceUri = process.env.MONGODB_URI;
const targetUri = process.env.MONGODB_URI_PROD;
const expectedSourceDbName = process.env.MIGRATE_SOURCE_DB_NAME || "studing_db";
const expectedTargetDbName = process.env.MIGRATE_TARGET_DB_NAME || "myapp_production";

const collections = [
  "assets",
  "tasks",
  "expenses",
  "milestones",
  "ideas",
  "competitors",
  "activities",
];

const connect = async (uri) => {
  const connection = mongoose.createConnection(uri, {
    bufferCommands: false,
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
  });
  await connection.asPromise();
  return connection;
};

const assertDatabases = (sourceConnection, targetConnection) => {
  const sourceName = sourceConnection.db.databaseName;
  const targetName = targetConnection.db.databaseName;
  if (sourceName !== expectedSourceDbName) {
    throw new Error(`Expected source db ${expectedSourceDbName} but connected to ${sourceName}`);
  }
  if (targetName !== expectedTargetDbName) {
    throw new Error(`Expected target db ${expectedTargetDbName} but connected to ${targetName}`);
  }
};

const migrateCollection = async (sourceDb, targetDb, name) => {
  const sourceCollection = sourceDb.collection(name);
  const targetCollection = targetDb.collection(name);
  const docs = await sourceCollection.find({}).toArray();
  if (docs.length === 0) {
    return { name, found: 0, upserted: 0, skipped: 0 };
  }
  const operations = docs.map((doc) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $setOnInsert: doc },
      upsert: true,
    },
  }));
  const result = await targetCollection.bulkWrite(operations, { ordered: false });
  const upserted = result.upsertedCount || 0;
  const skipped = docs.length - upserted;
  return { name, found: docs.length, upserted, skipped };
};

const run = async () => {
  if (!sourceUri || !targetUri) {
    throw new Error("MONGODB_URI and MONGODB_URI_PROD are required");
  }
  if (sourceUri === targetUri) {
    throw new Error("Source and target URIs must be different");
  }

  let sourceConnection;
  let targetConnection;

  try {
    sourceConnection = await connect(sourceUri);
    targetConnection = await connect(targetUri);
    assertDatabases(sourceConnection, targetConnection);

    const results = [];
    for (const name of collections) {
      const summary = await migrateCollection(sourceConnection.db, targetConnection.db, name);
      results.push(summary);
      console.log(
        `${summary.name}: found=${summary.found} upserted=${summary.upserted} skipped=${summary.skipped}`
      );
    }

    const totalFound = results.reduce((sum, item) => sum + item.found, 0);
    const totalUpserted = results.reduce((sum, item) => sum + item.upserted, 0);
    const totalSkipped = results.reduce((sum, item) => sum + item.skipped, 0);
    console.log(`total: found=${totalFound} upserted=${totalUpserted} skipped=${totalSkipped}`);
  } finally {
    if (sourceConnection) {
      await sourceConnection.close();
    }
    if (targetConnection) {
      await targetConnection.close();
    }
  }
};

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
