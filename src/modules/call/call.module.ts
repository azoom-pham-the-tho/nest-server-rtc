import { Module } from '@nestjs/common';
import { CallService } from './call.service';
import { CallGateway } from './call.gateway';
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
  providers: [CallGateway, CallService, JwtService],
})
export class CallModule {}
