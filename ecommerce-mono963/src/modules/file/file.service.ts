import { Injectable, Inject } from '@nestjs/common';
import { v2 as CloudinaryType } from 'cloudinary';
import { Readable } from 'stream';
import { ProductsService } from '../products/products.service';
import { FileRepository } from './file.repository';
import { CloudinaryUploadResult } from './interface/file.interface';

@Injectable()
export class FileService {
  constructor(
    private readonly productService: ProductsService,
    private readonly fileRepository: FileRepository,
    @Inject('CLOUDINARY') private readonly cloudinary: typeof CloudinaryType,
  ) {}

  async uploadImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    try {
      console.log('[uploadImage] Buscando producto...');
      const product = await this.productService.findProductEntityById(id);
      console.log('[uploadImage] Producto encontrado:', product.id);

      if (!file || !file.buffer) {
        console.error('[uploadImage] Archivo vacío o no proporcionado');
        throw new Error('Archivo inválido');
      }

      const streamUpload = (): Promise<CloudinaryUploadResult> => {
        return new Promise((resolve, reject) => {
          const stream = this.cloudinary.uploader.upload_stream(
            { folder: 'products' },
            (error, result) => {
              if (error || !result) {
                console.error('[uploadImage] Error Cloudinary:', error);
                return reject(new Error('Error al subir imagen a Cloudinary'));
              }
              resolve(result as CloudinaryUploadResult);
            },
          );

          Readable.from(file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload();

      console.log('[uploadImage] Imagen subida:', result.secure_url);

      const image = this.fileRepository.create({
        url: result.secure_url,
        mimeType: file.mimetype,
        product,
      });

      await this.fileRepository.save(image);

      return { id: image.id, url: image.url };
    } catch (err) {
      console.error('[ERROR uploadImage]', err);
      throw err;
    }
  }
}
