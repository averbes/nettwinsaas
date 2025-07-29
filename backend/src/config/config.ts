import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env
dotenv.config();

const config = {
  // Configuración del servidor
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Base de datos
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nettwinsaas',
  
  // Autenticación JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
  
  // CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  
  // Logs
  logs: {
    level: process.env.LOG_LEVEL || 'debug',
  },
};

export default config;
