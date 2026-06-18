import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';

dotenv.config();

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb+srv://ayushsinha391_db_user:9qVtNBfDF3JiC1ft@cluster0.tj2ocpv.mongodb.net/formbuilder?appName=Cluster0';
    
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('Starting persistent local MongoDB instance...');
        const mongoServer = await MongoMemoryServer.create({
          instance: {
            dbPath: path.join(__dirname, '../../mongo-data'),
            storageEngine: 'wiredTiger',
          }
        });
        uri = mongoServer.getUri();
      } catch (err: any) {
        // If port conflicts or db lock occurs, fall back to default transient mode
        console.log('Falling back to transient local MongoDB...', err.message);
        const mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
      }
    }
    
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
