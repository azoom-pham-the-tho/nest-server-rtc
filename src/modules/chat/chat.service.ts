import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ChatTypeEnum, GroupChatTypeEnum } from 'helpers/enum';
import moment from 'moment';
import { Model } from 'mongoose';
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
    const decoded = this.jwtService.verify(auth, {
      secret: process.env.JWT_SECRET,
    });
    return decoded;
  }

  getListGroupChat(userId: string) {
    return this.chatModel.find({ members: { $in: [userId] } });
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

  getChatInGroup(groupId: string, page: number = 1, limit: number = 20) {
    const skip = page * limit;
    return this.chatModel.aggregate([
      { $match: { _id: groupId } },
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
        },
      },
    ]);
  }

  chatInGroup(groupId: string, message: MessageChat) {
    return this.chatModel.updateOne(
      { _id: groupId },
      { $push: { messages: message } },
      { upsert: true },
    );
  }

  deleteMessageInGroup(groupId: string, keyMessage: string) {
    return this.chatModel.updateOne(
      { _id: groupId, '$messages.id': keyMessage },
      { isHidden: true },
    );
  }
}
