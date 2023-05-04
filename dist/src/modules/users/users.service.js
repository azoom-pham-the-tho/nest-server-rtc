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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_shema_1 = require("../../schemas/user.shema");
const mongoose_2 = require("mongoose");
const call_schema_1 = require("../../schemas/call.schema");
let UsersService = class UsersService {
    constructor(userModel, callModel) {
        this.userModel = userModel;
        this.callModel = callModel;
    }
    findUserById(id) {
        return id;
    }
    createUser(body) {
        body.status = 0;
        const user = new this.userModel(body);
        return user.save();
    }
    findUserByName(name) {
        return this.userModel.findOne({ name });
    }
    updateStatusUser(id, status) {
        return this.userModel.updateOne({ _id: id }, { status });
    }
    getListUser() {
        return this.userModel.find({}, '-pass ');
    }
    getUserById(id) {
        return this.userModel.find({ _id: id }, '-pass ');
    }
    insertHistory(caller) {
        const call = new this.callModel(caller);
        return call.save();
    }
    getCallerByRoomId(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const caller = yield this.callModel.findOne({ roomId });
            console.log('getCallerByRoomId', caller);
            return {
                userHost: caller.userHost,
                userJoin: caller.userJoin,
            };
        });
    }
    updateHistoryEndCall(roomId, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            if (endTime) {
                yield this.callModel.updateOne({ roomId }, {
                    endTime,
                });
            }
        });
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_shema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(call_schema_1.Call.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map