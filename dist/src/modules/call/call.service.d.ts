import { JwtService } from '@nestjs/jwt';
export declare class CallService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    verifyToken(token: string): any;
}
