import {
  Controller,
  HttpCode,
  Post,
  InternalServerErrorException,
  Get,
  Body,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AuthGuard } from 'src/guards/auth.guards';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/guards/auth.guards.admin';
import { Roles } from 'src/decorator/role.decorator';
import { UserRole } from '../user/Entities/user.entity';

@ApiTags('Category')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAll(): Promise<Category[]> {
    return this.categoriesService.getCategories();
  }

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.createCategory(dto);
  }

  @Post('seeder')
  @HttpCode(201)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
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
