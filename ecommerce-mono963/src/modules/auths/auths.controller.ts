import {
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { SignInDto, SignUpDto } from './Dto/auths.Dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthsController {
  constructor(private readonly authService: AuthsService) {}

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() credentials: SignInDto) {
    try {
      return await this.authService.signin(
        credentials.email,
        credentials.password,
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error inesperado al intentar iniciar sesión',
      );
    }
  }

  @Post('signup')
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signup(@Body() newUser: SignUpDto) {
    try {
      return await this.authService.signup(newUser);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
