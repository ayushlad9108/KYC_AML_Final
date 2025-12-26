import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectDB() {
  const uri = env.MONGO_URI;
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`[DB] Connected: ${mongoose.connection.host}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
