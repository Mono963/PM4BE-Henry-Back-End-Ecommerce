import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from '../user/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './Dto/auths.Dto';
import { UserRole } from '../user/Entities/user.entity';

@Injectable()
export class AuthsService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signin(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Credenciales inválidas');
    }

    const user = await this.userService.findByEmail(email);
    const isMatch = user && (await bcrypt.compare(password, user.password));

    if (!user || !isMatch) {
      throw new BadRequestException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role, // 🔥 Este era el que te faltaba
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      accessToken: token,
      expiresIn: 3600,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async signup(data: SignUpDto) {
    const { password, confirmPassword, ...rest } = data;

    if (!password || !confirmPassword) {
      throw new BadRequestException('Debe proporcionar ambas contraseñas');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const createdUser = await this.userService.createUserService({
        ...rest,
        password: hashedPassword,
        role: UserRole.USER,
      });
      return createdUser;
    } catch (err: unknown) {
      console.error(err);
      throw new InternalServerErrorException('Error al registrar usuario');
    }
  }
}
