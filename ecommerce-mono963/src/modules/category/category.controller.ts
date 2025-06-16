import {
  Controller,
  HttpCode,
  Post,
  InternalServerErrorException,
  Get,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAll(): Promise<Category[]> {
    return this.categoriesService.getCategories();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.createCategory(dto);
  }

  @Post('seeder')
  @HttpCode(201)
  async seedCategories() {
    try {
      return await this.categoriesService.preloadCategories();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al precargar las categorías',
      );
    }
  }
}
