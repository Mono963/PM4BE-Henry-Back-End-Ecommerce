import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './Entities/products.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { CategoriesModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    forwardRef(() => CategoriesModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
