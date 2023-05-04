import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CallService {
  constructor(private readonly jwtService: JwtService) {}

  verifyToken(token: string) {
    const auth = token.split(' ')[1];
    const decoded = this.jwtService.verify(auth, {
      secret: process.env.JWT_SECRET,
    });
    return decoded;
  }
}
