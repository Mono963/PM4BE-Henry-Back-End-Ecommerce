import { ResponseProductDto } from 'src/modules/products/Dto/products.Dto';
import { Product } from 'src/modules/products/Entities/products.entity';

export function mapToProductDto(product: Product): ResponseProductDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    category_name: product.category?.categoryName ?? '',
    files:
      product.files?.map((file) => ({
        id: file.id,
        url: file.url,
      })) ?? [],
  };
}
