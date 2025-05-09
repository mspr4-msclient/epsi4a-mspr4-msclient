import mongoose from 'mongoose';


export async function connectToDatabase() {
  try {
    const uri = "mongodb+srv://antletailleur:iz1Y0XjM7YKVXODv@epsi4a-mspr4-msclient.kj5ccfc.mongodb.net/client";
    await mongoose.connect(uri);
    console.log('✅ MongoDB connecté via Mongoose');
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB :', err);
    process.exit(1);
  }
}