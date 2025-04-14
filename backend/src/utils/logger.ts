import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { loggerConfig } from '../config/logger.config';

// Vytvoření adresáře pro logy pokud neexistuje
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true });
}

// Definice formátu logu
const logFormat = winston.format.combine(
	winston.format.timestamp({ format: loggerConfig.dateFormat }),
	winston.format.errors({ stack: true }),
	winston.format.splat(),
	winston.format.json()
);

// Vytvoření loggeru
export const logger = winston.createLogger({
	level: loggerConfig.level,
	format: logFormat,
	transports: [
		// Zápis chyb do error.log
		new winston.transports.File({
			filename: loggerConfig.errorLogPath,
			level: 'error',
			maxsize: loggerConfig.maxSize,
			maxFiles: loggerConfig.maxFiles,
		}),
		// Zápis všech logů do combined.log
		new winston.transports.File({
			filename: loggerConfig.combinedLogPath,
			maxsize: loggerConfig.maxSize,
			maxFiles: loggerConfig.maxFiles,
		}),
	],
});

// V development prostředí přidáme výstup do konzole
if (process.env.NODE_ENV !== 'production') {
	logger.add(new winston.transports.Console({
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.simple()
		),
	}));
}
