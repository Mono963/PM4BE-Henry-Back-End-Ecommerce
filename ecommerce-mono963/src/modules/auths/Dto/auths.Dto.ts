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
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
  password: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  address: string;

  @ApiProperty()
  @IsNumber()
  phone: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  city?: string;
}

export class SignInDto extends PickType(SignUpDto, ['password', 'email']) {}
