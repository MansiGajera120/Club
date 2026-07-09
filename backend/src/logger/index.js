import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import winston from 'winston';
import config from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.resolve(__dirname, '../../logs');

// Ensure the logs directory exists before any file transport writes to it.
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

/**
 * Human-friendly console format for local development.
 */
const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} ${level}: ${stack || message}`;
  })
);

/**
 * Structured JSON format for files (easy to ship to log aggregators).
 */
const fileFormat = combine(timestamp(), errors({ stack: true }), json());

const transports = [new winston.transports.Console({ format: consoleFormat })];

// File transports are useful locally; cloud hosts (Render) capture stdout instead.
if (!config.isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: config.logLevel,
  levels: winston.config.npm.levels,
  transports,
  exitOnError: false,
});

/**
 * Writable stream adapter so morgan can pipe HTTP logs through winston.
 */
export const httpLogStream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;
