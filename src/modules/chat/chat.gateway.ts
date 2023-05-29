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
import { GroupChatTypeEnum, UserStatusEnum } from 'helpers/enum';

@WebSocketGateway({
  namespace: 'chat',
  // path: '/chat',
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
        if (group.type == GroupChatTypeEnum.NORMAL) {
          group.members.map((member) => {
            if (member._id != client['user'].id) {
              group.name = member.name;
            }
          });
        }
        return group;
      }),
    );

    client.emit('group-chat', group);
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
  @SubscribeMessage('group-chat-user-to-user')
  async getGroupChatOfUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const group = await this.chatService.getGroupOfUserToUser(
      userId,
      client['user'],
    );

    client.emit('group-chat-user-to-user', group?._id);
  }

  @SubscribeMessage('message-in-group')
  async getMessageChat(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { groupId, page } = body;
    console.log('message-in-group', body);

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
    const { groupId, message, type } = body;
    console.log(body);

    //save message
    if (type == GroupChatTypeEnum.GROUP) {
      console.log('chat in group');

      await this.chatService.chatInGroup(groupId, client['user'], message);
    }
    if (type == GroupChatTypeEnum.NORMAL) {
      console.log('chat in user');
      await this.chatService.chatToUser(groupId, client['user'], message);
    }
    this.wss.to(groupId).emit('chat');
  }

  @SubscribeMessage('delete-group')
  async deleteGroupChat(
    @MessageBody() groupId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await this.chatService.deleteGroup(groupId);
    client.emit('delete-group');
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
