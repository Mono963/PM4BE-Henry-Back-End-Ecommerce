import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from 'src/modules/auths/interface/uth-request.interface';
import { AuthGuard } from './auth.guards';
import { UserRole } from 'src/modules/user/Entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleGuard extends AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Validar token con el guard padre
    const canActivate = await super.canActivate(context);
    if (!canActivate) return false;

    // Obtener roles permitidos del decorador @Roles()
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenException('Acceso restringido a administradores');
    }

    return true;
  }
}
