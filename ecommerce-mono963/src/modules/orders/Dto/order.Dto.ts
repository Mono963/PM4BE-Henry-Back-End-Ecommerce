import {
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ProductIdDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductIdDto)
  products: ProductIdDto[];
}
