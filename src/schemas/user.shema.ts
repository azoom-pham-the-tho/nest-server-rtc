import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: { createdAt: 'createdAt' } })
export class User {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  pass: String;

  @Prop({ type: Number })
  status: number;

  @Prop({ type: Date })
  createdAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
