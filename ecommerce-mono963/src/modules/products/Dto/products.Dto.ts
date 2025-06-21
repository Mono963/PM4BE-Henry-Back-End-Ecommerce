import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Length } from 'class-validator';
import { ResponseFileDto } from 'src/modules/file/dto/file.Dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Remera básica' })
  @IsString()
  @Length(3, 80)
  name: string;

  @ApiProperty({ example: 'Remera de algodón 100%' })
  @IsString()
  @Length(10, 500)
  description: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'Ropa' })
  @IsString()
  @Length(3, 50)
  categoryName: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Remera negra' })
  @IsOptional()
  @IsString()
  @Length(3, 80)
  name?: string;

  @ApiPropertyOptional({ example: 'Remera negra de manga larga' })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  description?: string;

  @ApiPropertyOptional({ example: 59.99 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 'Invierno' })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  categoryName?: string;
}

export class ResponseProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_name: string;
  files: ResponseFileDto[];
}
