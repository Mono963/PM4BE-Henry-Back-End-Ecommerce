export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  isAdmin: boolean;
  exp: number;
  iat?: number;
}
