import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { connectToDatabase } from './db/connection';
import { UserModel } from './models/user.model';
import { Types } from 'mongoose';


//** SERVER */
const app = express();
dotenv.config();
app.listen(8080, () => {
  console.log(`✅ Microservice User lancé sur : ${process.env.BASEURL || 'http://localhost'}:${process.env.PORT || '8080'}`);
});

//** MIDDLEWARE */
app.use(express.json());

//** DB */
connectToDatabase();

//** ROUTES */
app.post('/user', async (req: Request, res: Response) => {
  const { email, username, age } = req.body;

  if (!email || !username) {
    return res.status(400).json({ message: 'Champs manquants (email, username)' });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const newUser = await UserModel.create({ email, username, age });
    res.status(201).json({ message: 'Utilisateur créé avec succès', userId: newUser._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/user/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID invalide' });
    }

    const user = await UserModel.findById(id).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.patch('/user/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID invalide' });
    }
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/user/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID invalide' });
    }
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select('email username age');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});