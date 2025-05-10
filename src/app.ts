import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { connectToDatabase } from './db/connection';
import swaggerDocs from './swagger';


//** SERVER */
const app = express();
dotenv.config();
const port = parseInt(process.env.PORT || '8080');
const baseUrl = process.env.BASEURL || 'http://localhost';
app.listen(port, () => {
  console.log(`✅ Microservice User lancé sur : ${baseUrl}:${port}`);
  swaggerDocs(app, port);
  console.log(`📖 Documentation Swagger disponible sur : ${baseUrl}:${port}/docs`);
});

//** MIDDLEWARE */
app.use(express.json());

//** DB */
connectToDatabase();

//** ROUTES */
app.use('/api/v1/client', require("./routers/user.router"));