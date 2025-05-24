import { auth } from 'express-openid-connect';
import { UserModel } from '../models/user.model';


export default class UserService {
    async getUserByEmail(email: string) {
        try {
            const user = await UserModel.findOne({ email });
            return user;
        } catch (err) {
            console.error(err);
            throw new Error('Erreur lors de la récupération de l\'utilisateur par email');
        }
    }

    async getUserByAuthId(auth_id: string) {
        try {
            const user = await UserModel.findOne({ auth_id })
                .select('email first_name last_name birth_date is_validated auth_id created_at');
            return user;
        } catch (err) {
            console.error(err);
            throw new Error('Erreur lors de la récupération de l\'utilisateur par auth_id');
        }
    }

    async createUser({email, first_name, last_name, birth_date, auth_id }: {email: string, first_name: string, last_name: string, birth_date: string, auth_id: string}) {    
        try {
            const newUser = await UserModel.create({ email, first_name, last_name, birth_date, is_validated: true, auth_id, created_at: new Date() });
            return newUser;
        } catch (err) {
            console.error(err);
            throw new Error('Erreur lors de la création de l\'utilisateur');
        }
    }

    async updateUser({ auth_id, data }: { auth_id: string, data: any }) {
        try {

            const updatedUser = await UserModel.findOneAndUpdate(
                { auth_id },
                data,
                { new: true, runValidators: true }
            );

            return updatedUser
        } catch (err) {
            console.error(err);
            throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
        }
    }

    async deleteUser({ auth_id }: { auth_id: string }) {
        try {
            const deletedUser = await UserModel.findOneAndDelete({auth_id});
            return deletedUser;
        } catch (err) {
            console.error(err);
            throw new Error('Erreur lors de la suppression de l\'utilisateur');
        }
    }

    async getAllUsers({ page = 1, limit = 10 }: { page?: number, limit?: number }) {
        try {
            const skip = (page - 1) * limit;

            const users =  await UserModel.find()
                .select('email first_name last_name birth_date is_validated auth_id created_at')
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit);
            
            const total = await UserModel.countDocuments();

            return {
                users,
                total,
                page,
                total_pages: Math.ceil(total / limit)
            };
            
        } catch (err) {
            console.error(err);
            throw new Error('Erreur lors de la récupération de tous les utilisateurs');
        }
    }
}