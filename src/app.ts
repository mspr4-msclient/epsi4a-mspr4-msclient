import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { connectToDatabase } from './db/connection';
import swaggerDocs from './swagger';
import cors from 'cors';


//** SERVER */
const app = express();
dotenv.config();
const port = parseInt(process.env.PORT_CLIENT || '8080');
const baseUrl = process.env.BASEURL_CLIENT || 'http://localhost';
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
app.use('/api/v1/client', require("./routers/user.router"));