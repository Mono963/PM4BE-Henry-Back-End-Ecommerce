import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Falta el header Authorization');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Basic:') {
      throw new UnauthorizedException('Formato de Authorization inválido');
    }

    const credentials = parts[1].split(':');

    if (credentials.length !== 2 || !credentials[0] || !credentials[1]) {
      throw new UnauthorizedException(
        'Authorization debe incluir email y password',
      );
    }

    return true;
  }
}
