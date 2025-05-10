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

    async createUser({email, username, age}: {email: string, username: string, age?: number}) {    
        try {
            const newUser = await UserModel.create({ email, username, age });
            return newUser;
        } catch (err) {
            console.error(err);
            throw new Error('Erreur lors de la création de l\'utilisateur');
        }
    }

    async getUserById({ id }: { id: string }) {
        try {
            const user = await UserModel.findById(id).select('-__v');
            return user;
        } catch (err) {
            console.error(err);
            throw new Error('Erreur lors de la récupération de l\'utilisateur par id');
        }
    }

    async updateUser({ id, data }: { id: string, data: any }) {
        try {
            const updatedUser = await UserModel.findByIdAndUpdate(
                id,
                data,
                { new: true, runValidators: true }
            );
            return updatedUser
        } catch (err) {
            console.error(err);
            throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
        }
    }

    async deleteUser({ id }: { id: string }) {
        try {
            const deletedUser = await UserModel.findByIdAndDelete(id);
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
                .select('email username age')
                .skip(skip)
                .limit(limit);
            
            const total = await UserModel.countDocuments();

            return {
                users,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
            
        } catch (err) {
            console.error(err);
            throw new Error('Erreur lors de la récupération de tous les utilisateurs');
        }
    }
}