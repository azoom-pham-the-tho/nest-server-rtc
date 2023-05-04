"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const jwt_1 = require("@nestjs/jwt");
const user_shema_1 = require("../../schemas/user.shema");
const mongoose_1 = require("@nestjs/mongoose");
const call_schema_1 = require("../../schemas/call.schema");
let UsersModule = class UsersModule {
};
UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_shema_1.User.name, schema: user_shema_1.UserSchema },
                { name: call_schema_1.Call.name, schema: call_schema_1.CallSchema },
            ]),
        ],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService, jwt_1.JwtService],
        exports: [
            jwt_1.JwtService,
            users_service_1.UsersService,
            mongoose_1.MongooseModule.forFeature([
                { name: user_shema_1.User.name, schema: user_shema_1.UserSchema },
                { name: call_schema_1.Call.name, schema: call_schema_1.CallSchema },
            ]),
        ],
    })
], UsersModule);
exports.UsersModule = UsersModule;
//# sourceMappingURL=users.module.js.map