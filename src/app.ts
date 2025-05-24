import dotenv from 'dotenv';
import express from 'express';
import { connectToDatabase } from './db/connection';
import swaggerDocs from './swagger';
import cors from 'cors';
import path from 'path';


//** SERVER CONFIGURATIONS */*
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, `../environment/.env.client.${env}`);
dotenv.config({ path: envPath });
const defaultConfig = require('./configs/development');
let envConfig = {};

try {
  envConfig = require(`./configs/${process.env.NODE_ENV || 'development'}`);
} catch (error) {
  console.error("Erreur lors du chargement de la configuration :", error);
  process.exit(1);
}

const config = {
  ...defaultConfig,
  ...envConfig, 
}

const app = express();
const port = config.PORT;
const baseUrl = config.BASE_URL;
app.listen(port, () => {
  console.log(`✅ Microservice User lancé sur : ${baseUrl}:${port}`);
  swaggerDocs(app);
});

//** MIDDLEWARE */
app.use(express.json());
app.use(cors({
  origin: '*',
}));

//** DB */
connectToDatabase();

//** ROUTES */
app.use('/api/v1/clients', require("./routers/user.router"));
