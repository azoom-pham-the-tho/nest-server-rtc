import { UsersService } from '@modules/users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ChatTypeEnum, GroupChatTypeEnum } from 'helpers/enum';
import moment from 'moment';
import mongoose, { Model } from 'mongoose';
import { Chat, MessageChat } from 'schemas/chat.schema';

@Injectable()
export class ChatService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    private readonly usersService: UsersService,
  ) {}

  verifyToken(token: string) {
    const auth = token.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(auth, {
        secret: process.env.JWT_SECRET,
      });
      return decoded;
    } catch (error) {
      return new BadRequestException();
    }
  }

  getListGroupChat(userId: string) {
    return this.chatModel.aggregate([
      { $match: { members: { $in: [userId] } } },
      {
        $project: {
          messages: {
            $slice: [
              {
                $reverseArray: '$messages',
              },
              0,
              1,
            ],
          },
          read: true,
          name: true,
          type: true,
          members: true,
        },
      },
    ]);
  }
  getUsers(users: string[]) {
    return this.usersService.getUsers(users);
  }
  getUserById(userId: string) {
    return this.usersService.getUserById(userId);
  }

  createGroupChat(userId: string, name: string, members: string[]) {
    const chat = new this.chatModel();
    chat.members = [userId, ...members];
    chat.name = name;
    chat.type = GroupChatTypeEnum.GROUP;
    return chat.save();
  }

  async addUserToGroup(groupId: string, userAdd: any, userJoin: string) {
    const getUserInfo = await this.usersService.getUserById(userJoin);
    const message: MessageChat = {
      userId: userAdd.id,
      name: userAdd.name,
      content: `${userAdd.name} đã thêm ${getUserInfo.name}`,
      type: ChatTypeEnum.NOTI,
      createdAt: moment().toString(),
    };
    return this.chatModel.updateOne(
      { _id: groupId },
      { $push: { members: userJoin, messages: message } },
      { upsert: true },
    );
  }

  async getChatInGroup(groupId: any, userId: string, page = 0, limit = 50) {
    const skip = page * limit;
    const id = new mongoose.Types.ObjectId(groupId);

    console.log(id);

    await this.chatModel.updateOne(
      { _id: groupId },
      { $addToSet: { read: userId } },
    );
    return await this.chatModel.aggregate([
      { $match: { _id: id } },
      {
        $project: {
          // phân trang trong mảng messgae bị đảo ngược
          messages: {
            $slice: [
              {
                $reverseArray: '$messages',
              },
              skip,
              limit,
            ],
          },
          read: true,
        },
      },
    ]);
  }

  chatInGroup(groupId: string, user: any, message: string) {
    const messageChat: MessageChat = {
      content: message,
      userId: user.id,
      createdAt: moment().toString(),
      type: ChatTypeEnum.NORMAL,
      name: user.name,
      id: `${user.id}-${moment().unix()}`,
      isHidden: false,
    };
    return this.chatModel.updateOne(
      { _id: groupId, type: GroupChatTypeEnum.GROUP },
      { $push: { messages: messageChat }, read: [] },
      { upsert: true },
    );
  }
  async chatToUser(groupId: string, user: any, message: string) {
    const groupChat = await this.chatModel.findOne({
      $and: [
        { members: { $in: [groupId] } },
        { members: { $in: [user.id] } },
        { type: GroupChatTypeEnum.NORMAL },
      ],
    });
    const messageChat: MessageChat = {
      content: message,
      userId: user.id,
      createdAt: moment().toString(),
      type: ChatTypeEnum.NORMAL,
      name: user.name,
      id: `${user.id}-${moment().unix()}`,
      isHidden: false,
    };
    console.log(groupChat?._id);

    if (!groupChat?._id) {
      const chat = new this.chatModel();
      chat.members = [user.id, groupId];
      chat.name = 'user chat';
      chat.messages = [messageChat];
      chat.type = GroupChatTypeEnum.NORMAL;
      await chat.save();
    } else {
      await this.chatModel.updateOne(
        {
          members: { $in: [groupId, user.id] },
          type: GroupChatTypeEnum.NORMAL,
        },
        { $push: { messages: messageChat }, read: [] },
        { upsert: true },
      );
    }
  }

  deleteMessageInGroup(groupId: string, keyMessage: string) {
    return this.chatModel.updateOne(
      { _id: groupId, 'messages.id': keyMessage },
      { $set: { 'messages.$.isHidden': true } },
    );
  }
  deleteGroup(groupId: string) {
    return this.chatModel.deleteOne({ _id: groupId });
  }

  getGroupOfUserToUser(userId: string, userCurrent: any) {
    console.log(userId, userCurrent.id);

    return this.chatModel.findOne({
      $and: [
        { members: { $in: [userId] } },
        { members: { $in: [userCurrent.id] } },
        { type: GroupChatTypeEnum.NORMAL },
      ],
    });
  }
}
