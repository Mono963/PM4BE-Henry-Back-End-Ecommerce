import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './Entities/products.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CategoriesModule } from '../category/category.module';
import { AuthsModule } from '../auths/auths.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    forwardRef(() => CategoriesModule),
    forwardRef(() => AuthsModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
