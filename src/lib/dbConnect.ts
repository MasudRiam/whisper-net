import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

// Cache connection in global scope to survive HMR / serverless re-use
const globalWithMongoose = globalThis as unknown as {
  _mongooseConnection?: ConnectionObject;
};
if (!globalWithMongoose._mongooseConnection) {
  globalWithMongoose._mongooseConnection = {} as ConnectionObject;
}
const connection: ConnectionObject = globalWithMongoose._mongooseConnection;

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  try {
    const db = await mongoose.connect(uri, {
      maxPoolSize: 10,
    });
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.error("DB connection failed", error);
    throw new Error("Database connection failed");
  }
}

export default dbConnect;