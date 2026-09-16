import mongoose from "mongoose";

type connectionObject = {
    isConnected? : number;
}

const connection: connectionObject = {};


async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log ("MongoDB already connected");
        return
    }

    try {
        const db = await mongoose.connect (process.env.MONGODB_URI || '', {})
        connection.isConnected = db.connections[0].readyState

        console.log ("DB connection is successfuly")
    } catch (error) {
        console.log ("DB connection is fail", error);

        process.exit (1)
    }
}

export default dbConnect;