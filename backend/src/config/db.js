import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  mongoose.set('strictQuery', true);
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  await mongoose.connect(uri);
  return mongoose.connection;
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
