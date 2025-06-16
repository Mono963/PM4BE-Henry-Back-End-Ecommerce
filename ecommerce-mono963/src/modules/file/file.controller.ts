import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('uploadImage/:id')
  @UseInterceptors(FileInterceptor('file'))
  uploadProductImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }
    return this.fileService.uploadImage(id, file);
  }
}
