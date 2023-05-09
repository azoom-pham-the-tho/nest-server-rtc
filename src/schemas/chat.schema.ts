import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

export class PeopleChat {
  avatar: string;
  name: string;
  storeId?: number;
  userId?: number;
}

export class CheckGroupChatData {
  status: number;
  people: PeopleChat[];
}

export class CheckJoinGroup {
  groupId: string;
  userId?: number;
  storeId?: number;
}

export class ChatData {
  keyId: string;
  content: string;
  time: Date;
  userId?: number;
  storeId?: number;
}

export class DeleteMessageData {
  messageKeyId: string;
  userId?: number;
  storeId?: number;
}

export class MessageChat {
  id?: Types.ObjectId;
  keyId?: string;
  userId?: number;
  storeId?: number;
  name?: string;
  avatar?: string;
  content: string;
  createdAt: Date;
  deletedAt?: Date;
}

export class UserChat {
  name: string;
  avatar: string;
  storeId?: number;
  userId?: number;
}

export class AudienceChat {
  store: { [x: number]: number };
  user: { [x: number]: number };
}

@Schema({ timestamps: { createdAt: 'createdAt' }, collection: 'chat_messages' })
export class Chat {
  @Prop({ type: String })
  groupId: string;

  @Prop({ type: Number })
  type: number;

  @Prop(raw([UserChat]))
  people: UserChat[];

  @Prop(raw([MessageChat]))
  messages: MessageChat[];

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop(raw([Number]))
  read: number[];

  @Prop({ type: Number })
  status: number;

  @Prop({ type: Boolean })
  isHidden?: boolean;

  @Prop(raw(AudienceChat))
  audience?: AudienceChat;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.index({ groupId: 'text' }, { unique: true });
