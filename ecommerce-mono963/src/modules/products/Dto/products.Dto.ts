import { IsString, IsNumber, IsOptional, Min, Length } from 'class-validator';
import { ResponseFileDto } from 'src/modules/file/dto/file.Dto';

export class CreateProductDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(3, 80, { message: 'El nombre debe tener entre 3 y 80 caracteres' })
  name: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(10, 500, {
    message: 'La descripción debe tener entre 10 y 500 caracteres',
  })
  description: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0.01, { message: 'El precio debe ser mayor a 0' })
  price: number;

  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @IsString({
    message: 'El nombre de la categoría debe ser una cadena de texto',
  })
  @Length(3, 50, {
    message: 'El nombre de la categoría debe tener entre 3 y 50 caracteres',
  })
  categoryName: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(3, 80)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

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
