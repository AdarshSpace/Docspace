import mongoose from 'mongoose';

const mongoDB_URL = process.env.DB_URL as string

if(!mongoDB_URL) {
    throw new Error('Database URL not found') 
}

const cached = (globalThis.mongooseCache ??= {
    conn: null,
    promise: null,
});


export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(mongoDB_URL);
    }

    try {
        cached.conn = await cached.promise;
        console.log("MongoDB connected successfully");
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error("MongoDB connection failed:", error);
        throw error;
    }
}