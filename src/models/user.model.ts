import { prop, getModelForClass } from '@typegoose/typegoose';


export class User {

  @prop({ required: true, unique: true })
  auth_id!: string;

  @prop({ required: true })
  first_name!: string;

  @prop({ required: true })
  last_name!: string;

  @prop({ required: true, unique: true })
  email!: string;

  @prop({ required: true})
  birth_date!: string;

  @prop({ default: false })
  is_validated!: boolean;

  @prop({ required: true, default: Date.now })
  created_at?: Date;
}

export const UserModel = getModelForClass(User);