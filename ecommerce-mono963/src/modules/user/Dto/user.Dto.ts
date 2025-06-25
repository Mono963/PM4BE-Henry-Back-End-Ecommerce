import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';
import { User } from '../Entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MiC0ntra$eña' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'Av. Siempre Viva 742' })
  @IsString()
  address: string;

  @ApiProperty({ example: 1134567890 })
  @IsNumber()
  phone: number;

  @ApiPropertyOptional({ example: 'Argentina' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Buenos Aires' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Buenos Aires' })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Juan Actualizado' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'nuevo@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NuevaC0ntra$eña' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
  password?: string;

  @ApiPropertyOptional({ example: 'Calle 123' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 1122334455 })
  @IsOptional()
  @IsNumber()
  phone?: number;

  @ApiPropertyOptional({ example: 'Chile' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Santiago' })
  @IsOptional()
  @IsString()
  city?: string;
}

export interface IUserResponseDto {
  id: string;
  name: string;
  email: string;
  phone: number;
  country?: string;
  address?: string;
  city?: string;
  orders: { id: string; date: Date }[];
}

export class ResponseUserDto {
  static toDTO(user: User): IUserResponseDto {
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

  static toDTOList(users: User[]): IUserResponseDto[] {
    return users.map((user) => this.toDTO(user));
  }
}

export interface IUserResponseWithAdmin extends IUserResponseDto {
  isAdmin: boolean;
}

export class ResponseUserWithAdminDto {
  static toDTO(user: User): IUserResponseWithAdmin {
    return {
      ...ResponseUserDto.toDTO(user),
      isAdmin: user.isAdmin,
    };
  }

  static toDTOList(users: User[]): IUserResponseWithAdmin[] {
    return users.map((user) => this.toDTO(user));
  }
}
