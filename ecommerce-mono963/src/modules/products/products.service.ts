import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './Entities/products.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  ResponseProductDto,
} from './Dto/products.Dto';
import { CategoriesService } from '../category/category.service';
import { PRODUCTS_SEED } from './data/products.data';
import { mapToProductDto } from './Dto/products.mapper';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}

  async getProducts(
    page?: number,
    limit?: number,
  ): Promise<ResponseProductDto[]> {
    const products = await this.productRepo.find({
      relations: ['category', 'orderDetails', 'files'],
    });

    const data = products.map(mapToProductDto);

    if (!page || !limit) return data;

    const start = (page - 1) * limit;
    return data.slice(start, start + limit);
  }

  async getProductById(id: string): Promise<ResponseProductDto> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'orderDetails', 'files'],
    });
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
    const product = this.productRepo.create({ ...dto, category });
    return this.productRepo.save(product);
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
  ): Promise<{ id: string }> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
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
    await this.productRepo.save(product);
    return { id: product.id };
  }

  async deleteProduct(id: string): Promise<{ id: string }> {
    const product = await this.productRepo.findOneBy({ id });
    if (!product)
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    await this.productRepo.remove(product);
    return { id };
  }

  async seedProducts() {
    const created: Product[] = [];

    for (const data of PRODUCTS_SEED) {
      const existing = await this.productRepo.findOneBy({ name: data.name });
      if (existing) continue;

      const category = await this.categoriesService.findByName(
        data.categoryName,
      );
      if (!category) continue;

      const product = this.productRepo.create({
        ...data,
        category,
      });

      await this.productRepo.save(product);
      created.push(product);
    }

    return {
      message: 'Productos precargados correctamente',
      total: created.length,
    };
  }

  async findProductEntityById(id: string): Promise<Product> {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.files', 'file')
      .where('product.id = :id', { id })
      .getOne();

    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    return product;
  }

  async saveProductEntity(product: Product): Promise<void> {
    await this.productRepo.save(product);
  }
}
