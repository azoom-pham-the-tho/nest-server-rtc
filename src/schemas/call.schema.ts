import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CallDocument = Call & Document;

@Schema({ timestamps: { createdAt: 'createdAt' } })
export class Call {
  @Prop({ type: String })
  roomId: string;

  @Prop({ type: String })
  userHost: string;

  @Prop({ type: String })
  userJoin: string;

  @Prop({ type: String })
  startTime: string;

  @Prop({ type: String })
  endTime: string;

  @Prop({ type: Number })
  status: number;

  @Prop({ type: Date })
  createdAt?: Date;
}

export const CallSchema = SchemaFactory.createForClass(Call);
