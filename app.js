require('dotenv').config();


const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const app = express();
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(express.json());

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/user', async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: 'Champs manquants (email, password, username)' });
  }

  try {
    const users = readUsers();

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      username
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'Utilisateur créé avec succès', userId: newUser.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.listen(8080, () => console.log(`Users microservice on : ${process.env.BASEURL}:${process.env.PORT}`));