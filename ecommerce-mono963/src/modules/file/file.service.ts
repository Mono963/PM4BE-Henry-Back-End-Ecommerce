import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Readable } from 'stream';
import { v2 as CloudinaryType } from 'cloudinary';

import { ProductsService } from '../products/products.service';
import { File } from './entities/file.entity';
import { CloudinaryUploadResult } from './interface/file.interface';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly productService: ProductsService,

    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,

    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof CloudinaryType,
  ) {}

  async uploadImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    if (!file || !file.buffer) {
      this.logger.error('Archivo vacío o no proporcionado');
      throw new BadRequestException('Archivo inválido');
    }

    const product = await this.productService.findProductEntityById(id);
    if (!product) {
      this.logger.warn(`Producto con ID ${id} no encontrado`);
      throw new NotFoundException(`Producto con ID ${id} no existe`);
    }

    this.logger.log(`Subiendo imagen para producto: ${product.id}`);

    const result = await this.uploadToCloudinary(file);

    this.logger.log(`Imagen subida correctamente: ${result.secure_url}`);

    const image = this.fileRepo.create({
      url: result.secure_url,
      mimeType: file.mimetype,
      product,
    });

    await this.fileRepo.save(image);

    return { id: image.id, url: image.url };
  }

  private uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        { folder: process.env.CLOUDINARY_FOLDER || 'products' },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Error al subir imagen a Cloudinary', error);
            return reject(new Error('Error al subir imagen a Cloudinary'));
          }
          resolve(result as CloudinaryUploadResult);
        },
      );

      Readable.from(file.buffer).pipe(stream);
    });
  }
}
