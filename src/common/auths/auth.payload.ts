export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  username: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  exp: number;
  iat?: number;
}
