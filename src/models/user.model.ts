import { prop, getModelForClass } from '@typegoose/typegoose';


export class User {
  @prop({ required: true })
  username!: string;

  @prop({ required: true, unique: true })
  email!: string;

  @prop()
  age?: number;
}

export const UserModel = getModelForClass(User);