import { IsEmail, IsString } from 'class-validator';

export class SigninDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;
}
