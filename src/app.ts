import dotenv from 'dotenv';
import express from 'express';
import { connectToDatabase } from './database/connection';
import swaggerDocs from './swagger';
import cors from 'cors';
import path from 'path';
import { Observability, getObservabilityMetrics, getSdk, metricsHandler } from './observability/otel';
import logger from './loggers/logger';
import { metricsMiddleware } from './observability/metrics.middleware';
import { tracesMiddleware } from './observability/traces.middleware';


//** SERVER CONFIGURATIONS */*
const env = process.env.NODE_ENV;

if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, `../environment/.env.client.${env}`);
  dotenv.config({ path: envPath });
}

const defaultConfig = require('./profiles/development');
let envConfig = {};

try {
  envConfig = require(`./profiles/${process.env.NODE_ENV}`);
} catch (error) {
  console.error("Erreur lors du chargement de la configuration :", error);
  process.exit(1);
}

export const config = {
  ...defaultConfig,
  ...envConfig,
}

export const app = express();
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

//** OBSERVABILITY */
app.use(tracesMiddleware);
Observability(config);
const { requestCounter, requestDuration, responseCounter } = getObservabilityMetrics();
app.use(metricsMiddleware(requestCounter, requestDuration, responseCounter));
getSdk().start();

//** DB */
connectToDatabase();

//** ROUTES */
app.use('/api/v1/clients', require("./routers/user.router"));
app.get('/metrics', metricsHandler);
