import dotenv from 'dotenv';
import express from 'express';
import { connectToDatabase } from './database/connection';
import swaggerDocs from './swagger';
import cors from 'cors';
import path from 'path';
import { requestCounter, errorCounter, requestDuration } from './observability/otel';
import logger from './loggers/logger';


//** SERVER CONFIGURATIONS */*
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, `../environment/.env.client.${env}`);
dotenv.config({ path: envPath });
const defaultConfig = require('./profiles/development');
let envConfig = {};

try {
  envConfig = require(`./profiles/${process.env.NODE_ENV || 'development'}`);
} catch (error) {
  console.error("Erreur lors du chargement de la configuration :", error);
  process.exit(1);
}

export const config = {
  ...defaultConfig,
  ...envConfig, 
}

const app = express();
const port = config.PORT;
const clientUrl = config.CLIENT_URL;
app.listen(port, () => {
  logger.info(`Microservice User is running on port ${clientUrl}:${port}`);
  console.log(`✅ Microservice User lancé sur : ${clientUrl}:${port}`);
  swaggerDocs(app);
});

//** MIDDLEWARE */
app.use(express.json());
app.use(cors({
  origin: '*',
}));
app.use((req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;

    const labels = {
      method: req.method,
      route: req.path,
      status_code: res.statusCode.toString(),
      env: process.env.NODE_ENV,
    };

    requestCounter.add(1, labels);
    requestDuration.record(duration, labels);

    if (res.statusCode >= 400) {
      errorCounter.add(1, labels);
    }
  });

  next();
});

//** DB */
connectToDatabase();

//** ROUTES */
app.use('/api/v1/clients', require("./routers/user.router"));
