"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const call_service_1 = require("./call.service");
const users_service_1 = require("../users/users.service");
const moment_1 = __importDefault(require("moment"));
const uuid_1 = require("uuid");
const enum_1 = require("../../helpers/enum");
let CallGateway = class CallGateway {
    constructor(callService, usersService) {
        this.callService = callService;
        this.usersService = usersService;
    }
    afterInit() {
        console.log(`Initialized ${this.constructor.name}`);
    }
    handleConnection(client) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`connect ${client.id}`);
            const token = client.handshake.headers.authorization;
            const user = yield this.callService.verifyToken(token);
            if (user) {
                client['user'] = user;
                client.join(`user_${user.id}`);
                yield this.usersService.updateStatusUser(user.id, enum_1.UserStatusEnum.ONLINE);
            }
            else {
                throw new websockets_1.WsException('auth token err');
            }
            return true;
        });
    }
    handleDisconnect(client) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`disconnect ${client.id}`);
            client.leave(`user_${client['user'].id}`);
            yield this.usersService.updateStatusUser(client['user'].id, enum_1.UserStatusEnum.OFFLINE);
            const users = yield this.usersService.getListUser();
            this.wss.sockets.emit('get-all-user', users);
        });
    }
    getAllUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.usersService.getListUser();
            this.wss.sockets.emit('get-all-user', users);
        });
    }
    callByUser(userId, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomId = (0, uuid_1.v4)();
            client.to(`user_${userId}`).emit('user-call', client['user'], roomId);
            const caller = {
                userHost: client['user'].id,
                userJoin: userId,
                startTime: (0, moment_1.default)().toString(),
                roomId,
            };
            yield this.usersService.insertHistory(caller);
        });
    }
    acceptJoinCall(body, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roomId, userHost } = body;
            client.to(`user_${userHost}`).emit('accept-join', roomId);
        });
    }
    rejectJoinCall(userId, client) {
        return __awaiter(this, void 0, void 0, function* () {
            client.to(`user_${userId}`).emit('reject-join');
        });
    }
    endCall(roomId, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userHost, userJoin } = yield this.usersService.getCallerByRoomId(roomId);
            client.to([`user_${userHost}`, `user_${userJoin}`]).emit('end-call');
            const current = (0, moment_1.default)().toString();
            yield this.usersService.updateHistoryEndCall(roomId, current);
        });
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Function)
], CallGateway.prototype, "wss", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-all-user'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "getAllUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('user-call'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "callByUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('accept-join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "acceptJoinCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('reject-join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "rejectJoinCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('end-call'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "endCall", null);
CallGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        pingInterval: 10000,
        pingTimeout: 2000,
        cors: {
            origin: '*',
            methods: '*',
        },
    }),
    __metadata("design:paramtypes", [call_service_1.CallService,
        users_service_1.UsersService])
], CallGateway);
exports.CallGateway = CallGateway;
//# sourceMappingURL=call.gateway.js.map