import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CategoriesService } from '../category/category.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ResponseProductDto,
} from './Dto/products.Dto';
import { Product } from './Entities/products.entity';
import { PRODUCTS_SEED } from './data/products.data';
import { mapToProductDto } from './Dto/products.mapper';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,

    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}

  async getProducts(
    page?: number,
    limit?: number,
  ): Promise<ResponseProductDto[]> {
    const products = await this.productsRepository.findAll();

    const data = products.map(mapToProductDto);

    if (!page || !limit) return data;

    const start = (page - 1) * limit;
    return data.slice(start, start + limit);
  }

  async getProductById(id: string): Promise<ResponseProductDto> {
    const product = await this.productsRepository.findById(id);
    if (!product)
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    return mapToProductDto(product);
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const category = await this.categoriesService.findByName(dto.categoryName);
    if (!category) {
      throw new NotFoundException(
        `Categoría '${dto.categoryName}' no encontrada`,
      );
    }
    const product = new Product();
    Object.assign(product, dto);
    product.category = category;
    return this.productsRepository.save(product);
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
  ): Promise<{ id: string }> {
    const product = await this.productsRepository.findById(id);
    if (!product)
      throw new NotFoundException(`Producto con id ${id} no encontrado`);

    if (dto.categoryName) {
      const category = await this.categoriesService.findByName(
        dto.categoryName,
      );
      if (!category)
        throw new NotFoundException(
          `Categoría '${dto.categoryName}' no encontrada`,
        );
      product.category = category;
    }

    Object.assign(product, dto);
    await this.productsRepository.save(product);
    return { id: product.id };
  }

  async deleteProduct(id: string): Promise<{ id: string }> {
    const product = await this.productsRepository.findById(id);
    if (!product)
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    await this.productsRepository.remove(product);
    return { id };
  }

  async seedProducts() {
    const created: Product[] = [];

    for (const data of PRODUCTS_SEED) {
      const existing = await this.productsRepository.findByName(data.name);
      if (existing) continue;

      const category = await this.categoriesService.findByName(
        data.categoryName,
      );
      if (!category) continue;

      const product = new Product();
      product.name = data.name;
      product.description = data.description;
      product.price = data.price;
      product.stock = data.stock;
      product.category = category;

      await this.productsRepository.save(product);
      created.push(product);
    }

    return {
      message: 'Productos precargados correctamente',
      total: created.length,
    };
  }

  async findProductEntityById(id: string): Promise<Product> {
    const product = await this.productsRepository.findByIdWithRelations(id);
    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return product;
  }
}
