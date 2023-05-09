import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import type { Server, Socket } from 'socket.io';
import { UsersService } from '@modules/users/users.service';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { UserStatusEnum } from 'helpers/enum';

@WebSocketGateway({
  // namespace: 'chat',
  path: '/chat',
  pingInterval: 10000,
  pingTimeout: 2000,
  cors: {
    origin: '*',
    methods: '*',
  },
})
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
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

    const user = await this.chatService.verifyToken(token);
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
    console.log(`disconnect ${client.id} outchat`);
  }

  @SubscribeMessage('create-group')
  async createGroup(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, content } = body;
    //save message
  }

  @SubscribeMessage('group-chat')
  async listGroupChat(@ConnectedSocket() client: Socket) {
    // list group chat of user and first chat current
  }

  @SubscribeMessage('add-user-to-group')
  async addUserToGroup(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, content } = body;
    //save message
  }

  @SubscribeMessage('message-chat')
  async getMessageChat(@ConnectedSocket() client: Socket) {
    // list group chat of user and first chat current
  }

  @SubscribeMessage('chat')
  async chatToUser(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, content } = body;
    //save message
  }

  @SubscribeMessage('delete-message')
  async deleteMesageChat(@ConnectedSocket() client: Socket) {
    // list group chat of user and first chat current
  }
}
