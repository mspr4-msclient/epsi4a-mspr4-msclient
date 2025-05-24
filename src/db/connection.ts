import mongoose from 'mongoose';


export async function connectToDatabase() {
  try {
    const uri = process.env.CLIENT_MONGO_CONNECTION_STRING || "mongodb+srv://antletailleur:iz1Y0XjM7YKVXODv@epsi4a-mspr4-msclient.kj5ccfc.mongodb.net/?retryWrites=true&w=majority";

    if (!uri) {
      throw new Error('URI de connexion MongoDB manquant dans les variables d\'environnement');
    }
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ MongoDB connecté via Mongoose');
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB :', err);
    process.exit(1);
  }
}