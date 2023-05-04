import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserStatusEnum } from 'helpers/enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  async getListUser() {
    return await this.usersService.getListUser();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.getUserById(id);
  }

  @Post('create')
  async createUser(@Body() body: CreateUserDto) {
    const { name } = body;
    const useExist = await this.usersService.findUserByName(name);
    if (useExist) return new BadRequestException();
    return await this.usersService.createUser(body);
  }
  @Post('login')
  async loginUser(@Body() body: CreateUserDto) {
    const { name, pass } = body;
    const user = await this.usersService.findUserByName(name);
    console.log(user);

    if (user.pass == pass) {
      const payload = {
        id: user._id,
        name: user.name,
      };

      await this.usersService.updateStatusUser(user._id, UserStatusEnum.ONLINE);
      const token = this.jwtService.sign(payload, {
        expiresIn: process.env.TOKEN_EXPRIRE,
        secret: process.env.JWT_SECRET,
      });
      return { token, user: payload };
    } else {
      return new BadRequestException();
    }
  }
}
