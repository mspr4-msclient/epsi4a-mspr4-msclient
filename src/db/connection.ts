import mongoose from 'mongoose';


export async function connectToDatabase() {
  try {
    const uri = process.env.CLIENT_MONGO_CONNECTION_STRING;

    if (!uri) {
      throw new Error('URI de connexion MongoDB manquant dans les variables d\'environnement');
    }
    
    await mongoose.connect(uri);
    console.log('✅ MongoDB connecté via Mongoose');
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB :', err);
    process.exit(1);
  }
}