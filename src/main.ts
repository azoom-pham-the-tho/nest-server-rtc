import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, UserSchema } from 'schemas/user.shema';
import { UserStatusEnum } from 'helpers/enum';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  app.enableCors({
    origin: '*',
    methods: '*',
  });

  await app.listen(8001);
  // const Users = mongoose.model(User.name, UserSchema);
  // await Users.updateMany({}, { status: UserStatusEnum.OFFLINE });
}
bootstrap();
