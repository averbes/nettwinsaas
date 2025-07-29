import app from './app';
import { connectDB } from './config/database';
import config from './config/config';
import logger from './utils/logger';

// Manejar excepciones no capturadas
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Conectar a la base de datos e iniciar el servidor
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
      logger.info(`🔗 http://localhost:${config.port}`);
    });

    // Manejar cierres inesperados
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

// Manejar promesas no manejadas
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});
