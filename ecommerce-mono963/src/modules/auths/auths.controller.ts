import {
  Body,
  Controller,
  Post,
  HttpCode,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { SigninDto } from './Dto/auths.Dto';

@Controller('auth')
export class AuthsController {
  constructor(private readonly authService: AuthsService) {}

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() credentials: SigninDto) {
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
}
