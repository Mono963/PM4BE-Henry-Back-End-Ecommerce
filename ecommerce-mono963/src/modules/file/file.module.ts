import { forwardRef, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { ProductsModule } from '../products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { CloudinaryProvider } from 'src/config/cloudinary';
import { AuthsModule } from '../auths/auths.module';

@Module({
  imports: [
    forwardRef(() => ProductsModule),
    TypeOrmModule.forFeature([File]),
    forwardRef(() => AuthsModule),
  ],
  controllers: [FileController],
  providers: [FileService, CloudinaryProvider],
  exports: [FileService],
})
export class FileModule {}
