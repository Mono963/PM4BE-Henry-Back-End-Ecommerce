import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class AddToCartDTO {
  @ApiProperty({
    example: 'c3f45d9a-0a44-4d8b-8b93-8f22987402f4',
    description: 'Product ID to add to cart',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDTO {
  @ApiProperty({
    example: 3,
    description: 'New quantity for the cart item. Set to 0 to remove.',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;
}

// dto/cart-response.dto.ts
export class CartItemResponseDTO {
  id: string;
  quantity: number;
  priceAtAddition: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imgUrls: string[];
  };
}

export class CartResponseDTO {
  id: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemResponseDTO[];
  itemCount: number;
}
