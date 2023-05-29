import { UsersService } from '@modules/users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import moment from 'moment';
import mongoose, { Model } from 'mongoose';
import { LiveStream } from 'schemas/live.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LiveStreamService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(LiveStream.name) private liveStreamModel: Model<LiveStream>,
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

  async createCalendarLivestream(
    userId: string,
    {
      title,
      description,
      startTime,
      endTime,
    }: {
      title: string;
      description: string;
      startTime: string;
      endTime: string;
    },
  ) {
    const livestream = new this.liveStreamModel();
    livestream.peerId = uuidv4();
    livestream.userId = userId;
    livestream.title = title;
    livestream.description = description;
    livestream.startTime = startTime;
    livestream.endTime = endTime;
    await livestream.save();
  }
  async getCalendars(page: 0, limit: 10) {
    const skip = page * limit;
    return await this.liveStreamModel
      .find()
      .sort('startTime')
      .skip(skip)
      .limit(limit);
  }
  getDetailLiveStream(id: string) {
    return this.liveStreamModel.findById(id);
  }

  async checkJoinLiveStream(id: string, userId: string) {
    const livestream = await this.liveStreamModel.findById(id);
    if (userId == livestream.userId) {
      // host join
      return { livestream, result: true };
    }
    if (moment().unix() < moment(livestream.startTime.toString()).unix()) {
      return { livestream, result: false, messgae: 'Buổi live chưa sẵn sàng' };
    }
    if (moment().unix() > moment(livestream.endTime.toString()).unix()) {
      return { livestream, result: false, messgae: 'Buổi live đã kết thúc' };
    }
  }
}
