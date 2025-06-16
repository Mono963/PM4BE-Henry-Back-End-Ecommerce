import {
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductIdDto {
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  id: string;
}

export class CreateOrderDto {
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId: string;

  @IsArray({ message: 'El campo products debe ser un arreglo' })
  @ArrayNotEmpty({ message: 'Debe haber al menos un producto en la orden' })
  @ValidateNested({ each: true })
  @Type(() => ProductIdDto)
  products: ProductIdDto[];
}
