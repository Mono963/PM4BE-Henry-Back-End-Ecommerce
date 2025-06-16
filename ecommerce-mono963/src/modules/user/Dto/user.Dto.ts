import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { User } from '../Entities/user.entity';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(80, { message: 'El nombre no debe superar los 80 caracteres' })
  name: string;

  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(15, { message: 'La contraseña no debe superar los 15 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message:
      'La contraseña debe tener al menos una minúscula, una mayúscula, un número y un carácter especial (!@#$%^&*)',
  })
  password: string;

  @IsString()
  @MinLength(3, { message: 'La dirección debe tener al menos 3 caracteres' })
  @MaxLength(80, { message: 'La dirección no debe superar los 80 caracteres' })
  address: string;

  @IsNumber()
  phone: number;

  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'El país debe tener al menos 5 caracteres' })
  @MaxLength(20, { message: 'El país no debe superar los 20 caracteres' })
  country?: string;

  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'La ciudad debe tener al menos 5 caracteres' })
  @MaxLength(20, { message: 'La ciudad no debe superar los 20 caracteres' })
  city?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  address?: string;

  @IsOptional()
  @IsNumber()
  phone?: number;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  country?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  city?: string;
}

export interface IUserResponsDto {
  id: string;
  name: string;
  email: string;
  phone: number;
  country?: string;
  address?: string;
  city?: string;
  orders: { id: string; date: Date }[];
}

export class ResponseProductsDto {
  static toDTO(user: User): IUserResponsDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      country: user.country,
      address: user.address,
      city: user.city,
      orders:
        user.orders?.map((order) => ({
          id: order.id,
          date: order.date,
        })) ?? [],
    };
  }

  static toDTOList(users: User[]): IUserResponsDto[] {
    return users.map((user) => this.toDTO(user));
  }
}
