import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { CategoriesRepository } from './category.repository';
import { PRODUCTS_SEED } from '../products/data/products.data';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async preloadCategories(): Promise<{ message: string }> {
    const uniqueCategoryNames = new Set<string>();
    const categoriesToInsert: Category[] = [];

    for (const cat of PRODUCTS_SEED) {
      const name = cat.categoryName;

      if (uniqueCategoryNames.has(name)) continue;
      uniqueCategoryNames.add(name);

      const exists = await this.categoriesRepository.findByName(name);
      if (!exists) {
        const newCategory = new Category();
        newCategory.categoryName = name;
        categoriesToInsert.push(newCategory);
      }
    }

    if (categoriesToInsert.length > 0) {
      await this.categoriesRepository.addCategories(categoriesToInsert);
      return { message: 'Categorías precargadas correctamente' };
    }

    throw new HttpException('Las categorías ya existen', HttpStatus.CONFLICT);
  }

  async getCategories(): Promise<Category[]> {
    return this.categoriesRepository.getCategories();
  }

  async findByName(categoryName: string): Promise<Category | null> {
    return this.categoriesRepository.findByName(categoryName);
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.categoriesRepository.findByName(dto.categoryName);
    if (exists) {
      throw new HttpException(
        `La categoría "${dto.categoryName}" ya existe`,
        HttpStatus.CONFLICT,
      );
    }

    const category = new Category();
    category.categoryName = dto.categoryName;

    return this.categoriesRepository.addNewCategories(category);
  }
}
