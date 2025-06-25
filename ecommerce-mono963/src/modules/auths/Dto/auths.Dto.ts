import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MiC0ntra$eñaSegura' })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
  password: string;

  @ApiProperty({ example: 'MiC0ntra$eñaSegura' })
  @IsString()
  confirmPassword: string;

  @ApiProperty({ example: 'Av. Siempre Viva 742' })
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  address: string;

  @ApiProperty({ example: 1134567890 })
  @IsNumber()
  phone: number;

  @ApiPropertyOptional({ example: 'Argentina' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  country?: string;

  @ApiPropertyOptional({ example: 'Buenos Aires' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  city?: string;
}

export class SignInDto extends PickType(SignUpDto, ['password', 'email']) {}
