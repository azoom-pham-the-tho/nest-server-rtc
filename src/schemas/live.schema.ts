import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LiveStreamDocument = LiveStream & Document;

export class ChatData {
  keyId: string;
  content: string;
  time: Date;
  userId?: string;
}

export class Comment {
  id?: string;
  userId: string;
  name: string;
  content: string;
  time: string;
  createdAt: string;
}

@Schema({ timestamps: { createdAt: 'createdAt' }, collection: 'livestreams' })
export class LiveStream {
  @Prop({ type: String })
  peerId: String;

  @Prop({ type: String })
  userId: String;

  @Prop({ type: String })
  title: String;

  @Prop({ type: String })
  description: String;

  @Prop({ type: String })
  startTime: String;

  @Prop({ type: String })
  endTime?: String;

  @Prop(raw([Comment]))
  comments?: Comment[];

  @Prop({ type: Number })
  status: number;
}

export const LiveStreamSchema = SchemaFactory.createForClass(LiveStream);

LiveStreamSchema.index({ _id: 'text' }, { unique: true });
