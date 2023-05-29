import { Module } from '@nestjs/common';
import { LiveStreamService } from './livestream.service';
import { LiveStreamGateway } from './livestream.gateway';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '@modules/users/users.module';
import { LiveStream, LiveStreamSchema } from 'schemas/live.schema';
@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: LiveStream.name, schema: LiveStreamSchema },
    ]),
  ],
  providers: [LiveStreamGateway, LiveStreamService, JwtService],
})
export class LiveStreamModule {}
