import winston from 'winston';
import config from '../config/config';

// Definir niveles de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir colores para la consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Añadir colores a winston
winston.addColors(colors);

// Definir formato para los logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Definir los transportes (consola y archivo)
const transports = [
  // Mostrar logs en consola
  new winston.transports.Console({
    format: format,
    level: 'debug', // Mostrar todos los niveles en desarrollo
  }),
  // Guardar solo logs de error en archivo
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json()
    ),
  }),
  // Guardar todos los logs en un archivo
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json()
    ),
  }),
];

// Crear el logger
const logger = winston.createLogger({
  level: config.logs.level,
  levels,
  format,
  transports,
  exitOnError: false, // No salir en excepciones manejadas
});

// Si no estamos en producción, mostrar logs de depuración
if (config.nodeEnv !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'debug',
    })
  );
}

export default logger;
