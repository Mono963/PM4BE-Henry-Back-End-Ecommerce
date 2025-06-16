import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from './Entities/products.entity';

@Injectable()
export class ProductsRepository {
  private readonly repo: Repository<Product>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(Product);
  }

  async findAll(): Promise<Product[]> {
    return this.repo.find({
      relations: ['category', 'orderDetails', 'files'],
    });
  }

  async findById(id: string): Promise<Product | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['category', 'orderDetails', 'files'],
    });
  }

  async findByName(name: string): Promise<Product | null> {
    return this.repo.findOne({ where: { name } });
  }

  async save(product: Product): Promise<Product> {
    return this.repo.save(product);
  }

  async remove(product: Product): Promise<Product> {
    return this.repo.remove(product);
  }

  async findByIdWithRelations(id: string): Promise<Product | null> {
    return this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.files', 'file')
      .where('product.id = :id', { id })
      .getOne();
  }
}
