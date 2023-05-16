import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ChatTypeEnum, GroupChatTypeEnum } from 'helpers/enum';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

export class ChatData {
  keyId: string;
  content: string;
  time: Date;
  userId?: string;
}

export class MessageChat {
  id?: string;
  userId?: string;
  name?: string;
  content: string;
  isHidden?: boolean = false;
  type: number = ChatTypeEnum.NORMAL;
  createdAt: string;
  deletedAt?: string;
}

@Schema({ timestamps: { createdAt: 'createdAt' }, collection: 'chats' })
export class Chat {
  @Prop({ type: Number, default: GroupChatTypeEnum.NORMAL })
  type: GroupChatTypeEnum;

  @Prop({ type: String })
  name: String;

  @Prop(raw([String]))
  members: String[];

  @Prop(raw([MessageChat]))
  messages: MessageChat[];

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop(raw([String]))
  read: string[];

  @Prop({ type: Number })
  status: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.index({ groupId: 'text' }, { unique: true });
