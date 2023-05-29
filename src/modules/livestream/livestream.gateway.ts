import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { LiveStreamService } from './livestream.service';
import type { Server, Socket } from 'socket.io';
import { UsersService } from '@modules/users/users.service';
import { UserStatusEnum } from 'helpers/enum';

@WebSocketGateway({
  namespace: 'livestream',
  // path: '/livestream',
  pingInterval: 10000,
  pingTimeout: 2000,
  cors: {
    origin: '*',
    methods: '*',
  },
})
export class LiveStreamGateway {
  constructor(
    private readonly liveStreamService: LiveStreamService,
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
    const user = await this.liveStreamService.verifyToken(token);
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
    console.log(`disconnect ${client.id} livestream`);
  }

  @SubscribeMessage('create-calendar')
  async createCalendar(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    await this.liveStreamService.createCalendarLivestream(
      client['user'].id,
      body,
    );
    client.emit('create-calendar');
  }

  @SubscribeMessage('get-calendar')
  async getCalendar(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { page, limit } = body;
    const calendars = await this.liveStreamService.getCalendars(page, limit);
    client.emit('get-calendar', calendars);
  }

  @SubscribeMessage('detail-livestream')
  async detailCalendar(
    @MessageBody() id: string,
    @ConnectedSocket() client: Socket,
  ) {
    const livestream = await this.liveStreamService.getDetailLiveStream(id);
    client.emit('detail-livestream', livestream);
  }

  @SubscribeMessage('check-livestream')
  async joinCalendar(
    @MessageBody() id: string,
    @ConnectedSocket() client: Socket,
  ) {
    const checkJoinLivestream =
      await this.liveStreamService.checkJoinLiveStream(id, client['user'].id);
    client.emit('check-livestream', checkJoinLivestream);
  }
}
