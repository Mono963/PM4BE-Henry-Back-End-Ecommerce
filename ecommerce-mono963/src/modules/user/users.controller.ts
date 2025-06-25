import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './users.service';
import {
  ResponseUserDto,
  ResponseUserWithAdminDto,
  UpdateUserDto,
} from './Dto/user.Dto';
import { AuthGuard } from 'src/guards/auth.guards';
import { Request } from 'express';
import { RoleGuard } from 'src/guards/auth.guards.admin';
import { UserRole } from './Entities/user.entity';
import { Roles } from 'src/decorator/role.decorator';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getUsersRole(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNumber = page ? Number(page) : undefined;
      const limitNumber = limit ? Number(limit) : undefined;
      const users = await this.userService.getUsers(pageNumber, limitNumber);
      return ResponseUserWithAdminDto.toDTOList(users);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  @ApiBearerAuth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const user = await this.userService.getUserServiceById(id);
      if (!user) throw new NotFoundException('Usuario no encontrado');
      return ResponseUserDto.toDTO(user);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        'ID inválido o error al obtener el usuario',
      );
    }
  }

  @Get('auth0')
  getAuth0protectec(@Req() req: Request) {
    console.log(req.oidc);
    return JSON.stringify(req.oidc.user);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiBody({ type: UpdateUserDto })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
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

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
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
