import { CallService } from './call.service';
import type { Server, Socket } from 'socket.io';
import { UsersService } from '@modules/users/users.service';
export declare class CallGateway {
    private readonly callService;
    private readonly usersService;
    constructor(callService: CallService, usersService: UsersService);
    readonly wss: Server;
    afterInit(): void;
    handleConnection(client: Socket): Promise<boolean>;
    handleDisconnect(client: Socket): Promise<void>;
    getAllUser(): Promise<void>;
    callByUser(userId: string, client: Socket): Promise<void>;
    acceptJoinCall(body: any, client: Socket): Promise<void>;
    rejectJoinCall(userId: string, client: Socket): Promise<void>;
    endCall(roomId: string, client: Socket): Promise<void>;
}
