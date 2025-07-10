import dotenv from 'dotenv';
import express from 'express';
import { connectToDatabase } from './database/connection';
import cors from 'cors';
import path from 'path';
import { Observability, getObservabilityMetrics, getSdk, metricsHandler } from './observability/otel';
import { metricsMiddleware } from './observability/metrics.middleware';
import { tracesMiddleware } from './observability/traces.middleware';


//** SERVER CONFIGURATIONS */*
const env = process.env.NODE_ENV ?? 'development';

if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, `../environment/.env.client.${env}`);
  console.log(`Chargement du fichier d'environnement : ${envPath}`);
  dotenv.config({ path: envPath });
}

const defaultConfig = require('./profiles/development');
let envConfig = {};

try {
  envConfig = require(`./profiles/${process.env.NODE_ENV}`);
  console.log(`Configuration chargée pour l'environnement : ${process.env.NODE_ENV}`);
} catch (error) {
  console.error("Erreur lors du chargement de la configuration :", error);
  process.exit(1);
}

export const config = {
  ...defaultConfig,
  ...envConfig,
}

if (process.env.NODE_ENV !== 'test') {
  Observability(config);
  getSdk().start();
}

const app = express();

//** MIDDLEWARE */
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: '*',
  }));
} else {
  app.use(cors({
    origin: ['http://34.42.114.30', 'https://paye-ton-kawa-bff-120571313220.europe-west1.run.app'],
  }));
}

if (process.env.NODE_ENV !== 'test') {
  app.use(tracesMiddleware);
  const { requestCounter, requestDuration, responseCounter } = getObservabilityMetrics();
  app.use(metricsMiddleware(requestCounter, requestDuration, responseCounter));
}

//** DB */
connectToDatabase();

//** ROUTES */
app.use('/api/v1/clients', require("./routers/user.router"));

if (process.env.NODE_ENV !== 'test') {
  app.get('/metrics', metricsHandler);
}

export default app;