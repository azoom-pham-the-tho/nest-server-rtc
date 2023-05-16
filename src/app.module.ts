import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CallModule } from './modules/call/call.module';
import { UsersModule } from './modules/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import dotenv from 'dotenv';
import { UserSchema, User } from 'schemas/user.shema';
import { CallSchema, Call } from 'schemas/call.schema';
import { ChatModule } from '@modules/chat/chat.module';
dotenv.config();
console.log(process.env.MONGODB_URI);

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Call.name, schema: CallSchema },
    ]),
    CallModule,
    ChatModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
