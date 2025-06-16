import { forwardRef, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { ProductsModule } from '../products/products.module';
import { FileRepository } from './file.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { CloudinaryProvider } from 'src/config/cloudinary';

@Module({
  imports: [forwardRef(() => ProductsModule), TypeOrmModule.forFeature([File])],
  controllers: [FileController],
  providers: [FileService, FileRepository, CloudinaryProvider],
  exports: [FileService],
})
export class FileModule {}
