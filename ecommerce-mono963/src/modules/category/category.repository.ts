import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesRepository {
  private readonly repo: Repository<Category>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(Category);
  }

  async getCategories(): Promise<Category[]> {
    return this.repo.find({ relations: ['products'] });
  }

  async addCategories(categories: Category[]): Promise<void> {
    await this.repo.save(categories);
  }

  async addNewCategories(categories: Category): Promise<Category> {
    return await this.repo.save(categories);
  }

  async findByName(categoryName: string): Promise<Category | null> {
    return this.repo.findOneBy({ categoryName });
  }
}
