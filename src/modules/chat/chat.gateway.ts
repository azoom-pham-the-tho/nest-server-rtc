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
    console.log(client['user']);

    const user = await this.chatService.verifyToken(token);
    console.log(user);

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
    const { name, members } = body;
    //save message
    await this.chatService.createGroupChat(client['user'].id, name, members);
    client.emit('create-group');
  }

  @SubscribeMessage('group-chat')
  async listGroupChat(@ConnectedSocket() client: Socket) {
    // list group chat of user and first chat current
    const groupChat = await this.chatService.getListGroupChat(
      client['user'].id,
    );

    const group = await Promise.all(
      groupChat.map(async (group) => {
        group.members = await this.chatService.getUsers(group.members);

        return group;
      }),
    );

    this.wss.sockets.emit('group-chat', group);
  }

  @SubscribeMessage('add-user-to-group')
  async addUserToGroup(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { groupId, userJoin } = body;
    return await this.chatService.addUserToGroup(
      groupId,
      client['user'].id,
      userJoin,
    );
  }

  @SubscribeMessage('message-in-group')
  async getMessageChat(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { groupId, page } = body;
    // client.join(groupId);
    // list group chat of user and first chat current
    const messageChat = await this.chatService.getChatInGroup(
      groupId,
      client['user'].id,
      page,
    );
    client.join(groupId);
    client.emit('message-in-group', messageChat[0]);
  }

  @SubscribeMessage('chat')
  async chatToUser(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { groupId, message } = body;
    //save message
    console.log(body);

    await this.chatService.chatInGroup(groupId, client['user'], message);
    this.wss.sockets.to(groupId).emit('chat');
  }

  @SubscribeMessage('delete-message')
  async deleteMesageChat(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { groupId, keyMessage } = body;
    await this.chatService.deleteMessageInGroup(groupId, keyMessage);
    client.emit('delete-message');
  }
}
