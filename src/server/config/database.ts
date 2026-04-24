import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crop_recommendation';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB successfully at ${mongoURI}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Exit process with failure
    process.exit(1);
  }
};
