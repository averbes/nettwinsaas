import mongoose from 'mongoose';
import config from './config';
import logger from '../utils/logger';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Manejar eventos de conexión
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to DB');
    });
    
    mongoose.connection.on('error', (err) => {
      logger.error(`Mongoose connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from DB');
    });
    
    // Cerrar la conexión cuando la aplicación se cierre
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
