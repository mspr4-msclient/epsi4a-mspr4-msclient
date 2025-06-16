import mongoose from 'mongoose';
import { config } from '../app';
import logger from '../loggers/logger';


export async function connectToDatabase() {
  try {
    const uri = config.CLIENT_MONGO_CONNECTION_STRING;

    if (!uri) {
      logger.error('URI de connexion MongoDB manquant dans les variables d\'environnement');
      throw new Error('URI de connexion MongoDB manquant dans les variables d\'environnement');
    }
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    logger.info('✅ MongoDB connecté via Mongoose');
    console.log('✅ MongoDB connecté via Mongoose');
  } catch (err) {
    logger.error('❌ Erreur de connexion MongoDB :', err);
    console.error('❌ Erreur de connexion MongoDB :', err);
    process.exit(1);
  }
}