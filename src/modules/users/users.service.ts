import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'schemas/user.shema';
import { Model } from 'mongoose';
import { Call } from 'schemas/call.schema';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Call.name) private callModel: Model<Call>,
  ) {}

  createUser(body) {
    body.status = 0;
    const user = new this.userModel(body);
    return user.save();
  }

  findUserByName(name: string) {
    return this.userModel.findOne({ name });
  }
  updateStatusUser(id: any, status: number) {
    return this.userModel.updateOne({ _id: id }, { status });
  }

  getListUser() {
    return this.userModel.find({}, '-pass ');
  }

  getUserById(id: any) {
    return this.userModel.findOne({ _id: id }, '-pass ');
  }

  insertHistory(caller: any) {
    const call = new this.callModel(caller);
    return call.save();
  }

  async getCallerByRoomId(roomId: string) {
    const caller = await this.callModel.findOne({ roomId });
    console.log('getCallerByRoomId', caller);

    return {
      userHost: caller.userHost,
      userJoin: caller.userJoin,
    };
  }

  async updateHistoryEndCall(roomId: string, endTime: string) {
    // write log calculate price
    //endTime = null => reject => free
    if (endTime) {
      await this.callModel.updateOne(
        { roomId },
        {
          endTime,
        },
      );
    }
  }
}
