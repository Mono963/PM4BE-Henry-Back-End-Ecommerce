import { UserRole } from 'src/modules/user/Entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  exp: number;
  iat?: number;
}
