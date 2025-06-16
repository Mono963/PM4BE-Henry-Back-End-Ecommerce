import { Injectable, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/users.service'; // Cambiado por el servicio

@Injectable()
export class AuthsService {
  constructor(
    private userService: UserService, // Inyectamos el servicio
  ) {}

  async signin(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email y password son requeridos');
    }

    const user = await this.userService.findByEmail(email);

    if (!user || user.password !== password) {
      throw new BadRequestException('Email o password incorrectos');
    }

    return {
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.name.toLowerCase().replace(/\s/g, ''),
      },
    };
  }
}
