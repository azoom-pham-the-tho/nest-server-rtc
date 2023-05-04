import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from 'schemas/user.shema';
import { MongooseModule } from '@nestjs/mongoose';
import { Call, CallSchema } from 'schemas/call.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Call.name, schema: CallSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
  exports: [
    JwtService,
    UsersService,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Call.name, schema: CallSchema },
    ]),
  ],
})
export class UsersModule {}
