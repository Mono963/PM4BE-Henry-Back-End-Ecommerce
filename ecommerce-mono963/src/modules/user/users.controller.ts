import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './users.service';
import { DateAdderInterceptor } from 'src/interceptors/date-adder.interceptor';
import { RequestWithDate } from './interface/extended-request';
import { CreateUserDto, UpdateUserDto } from './Dto/user.Dto';
import { AuthGuard } from '../auths/auth.gurds';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    try {
      const pageNumber = page ? Number(page) : undefined;
      const limitNumber = limit ? Number(limit) : undefined;
      return await this.userService.getUsers(pageNumber, limitNumber);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const user = await this.userService.getUserServiceById(id);
      if (!user) throw new NotFoundException('Usuario no encontrado');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        'ID inválido o error al obtener el usuario',
      );
    }
  }

  @Post()
  @UseInterceptors(DateAdderInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(201)
  async createUser(@Body() user: CreateUserDto, @Req() req: RequestWithDate) {
    try {
      console.log('Endpoint:', req.now);
      return await this.userService.createUserService(user);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al crear el usuario');
    }
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<UpdateUserDto>,
  ) {
    try {
      const updated = await this.userService.updateUserService(id, updateData);
      if (!updated) throw new NotFoundException('Usuario no encontrado');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Error al actualizar el usuario');
    }
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const deleted = await this.userService.deleteUserService(id);
      if (!deleted) throw new NotFoundException('Usuario no encontrado');
      return deleted;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Error al eliminar el usuario');
    }
  }
}
