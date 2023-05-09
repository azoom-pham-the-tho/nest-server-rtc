import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, User } from 'schemas/user.shema';
import { CallSchema, Call } from 'schemas/call.schema';
import { UsersModule } from '@modules/users/users.module';
@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Call.name, schema: CallSchema },
    ]),
  ],
  providers: [ChatGateway, ChatService, JwtService],
})
export class ChatModule {}
