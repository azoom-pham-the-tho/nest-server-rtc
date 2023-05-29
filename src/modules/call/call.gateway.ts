import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { CallService } from './call.service';
import type { Server, Socket } from 'socket.io';
import { UsersService } from '@modules/users/users.service';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { UserStatusEnum } from 'helpers/enum';

@WebSocketGateway({
  namespace: 'call',
  // path: '/call',
  pingInterval: 10000,
  pingTimeout: 2000,
  cors: {
    origin: '*',
    methods: '*',
  },
})
export class CallGateway {
  constructor(
    private readonly callService: CallService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  public readonly wss: Server;

  afterInit() {
    console.log(`Initialized ${this.constructor.name}`);
  }
  async handleConnection(client: Socket) {
    console.log(`connect ${client.id}`);
    const token = client.handshake.headers.authorization;

    const user = await this.callService.verifyToken(token);
    if (user) {
      client['user'] = user;
      client.join(`user_${user.id}`);
      await this.usersService.updateStatusUser(user.id, UserStatusEnum.ONLINE);
    } else {
      throw new WsException('auth token err');
    }
    return true;
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`disconnect ${client.id}`);
    //get room current => leave room
    client.leave(`user_${client['user'].id}`);
    await this.usersService.updateStatusUser(
      client['user'].id,
      UserStatusEnum.OFFLINE,
    );
    //new list user
    const users = await this.usersService.getListUser();
    this.wss.emit('get-all-user', users);
  }

  @SubscribeMessage('get-all-user')
  async getAllUser() {
    const users = await this.usersService.getListUser();
    this.wss.emit('get-all-user', users);
  }

  @SubscribeMessage('user-call')
  async callByUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = uuidv4();
    client.to(`user_${userId}`).emit('user-call', client['user'], roomId);
    const caller = {
      userHost: client['user'].id,
      userJoin: userId,
      startTime: moment().toString(),
      roomId,
    };

    await this.usersService.insertHistory(caller);
  }

  @SubscribeMessage('accept-join')
  async acceptJoinCall(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userHost } = body;

    client.to(`user_${userHost}`).emit('accept-join', roomId);
  }

  @SubscribeMessage('reject-join')
  async rejectJoinCall(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    // null => reject
    client.to(`user_${userId}`).emit('reject-join');
  }

  @SubscribeMessage('end-call')
  async endCall(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const { userHost, userJoin } = await this.usersService.getCallerByRoomId(
      roomId,
    );
    client.to([`user_${userHost}`, `user_${userJoin}`]).emit('end-call');
    const current = moment().toString();
    await this.usersService.updateHistoryEndCall(roomId, current);
  }
}
