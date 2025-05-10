import { Request, Response } from 'express';
import UserService from "../services/user.service"; 
import { Types } from 'mongoose';


const userService = new UserService();

export default class UserController {
    async createUser(req: Request, res: Response) {    
        try {
            const { email, username, age } = req.body;
        
            if (!email || !username) {
                return res.status(400).json({ message: 'Champs manquants (email, username)' });
            }

            const existingUser = await userService.getUserByEmail(email);
            
            if (existingUser) {
              return res.status(409).json({ message: 'Email déjà utilisé' });
            }
        
            const newUser = await userService.createUser({ email, username, age });
            res.status(201).json({ message: 'Utilisateur créé avec succès', userId: newUser._id });
          } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erreur serveur' });
          }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!Types.ObjectId.isValid(id)) {
              return res.status(400).json({ message: 'ID invalide' });
            }
        
            const user = await userService.getUserById({ id });

            if (!user) {
              return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
        
            res.status(201).json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'ID invalide' });
            }

            if (req.body.email !== undefined) {
                const existingUser = await userService.getUserByEmail(req.body.email);
            
                if (existingUser) {
                    return res.status(409).json({ message: 'Email déjà utilisé' });
                }
            }
        
            const updatedUser = await userService.updateUser({ id, data: req.body });

            if (!updatedUser) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            res.status(201).json({ message: 'Utilisateur mis à jour avec succès', updatedUser });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'ID invalide' });
            }

            const deletedUser = await userService.deleteUser({ id });

            if (!deletedUser) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const { users, total, totalPages } = await userService.getAllUsers({ page, limit });

            if (!users) {
                return res.status(404).json({ message: 'Erreur lors de la récupération de tous les utilisateurs' });
            }
            else if (users.length === 0) {
                return res.status(200).json({ message: 'Aucun utilisateur trouvé' });
            }

            res.status(201).json({
                page,
                totalPages,
                totalUsers: total,
                users
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }
}
