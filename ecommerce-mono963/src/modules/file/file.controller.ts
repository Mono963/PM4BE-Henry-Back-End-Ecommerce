import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FileService } from './file.service';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { FileResponseDto, UploadImageDto } from './dto/file.Dto';

import { AuthGuard } from 'src/guards/auth.guards';
import { RoleGuard } from 'src/guards/auth.guards.admin';
import { Roles } from 'src/decorator/role.decorator';
import { UserRole } from '../user/Entities/user.entity';

@ApiTags('File')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiBearerAuth()
  @Post('uploadImage/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: UploadImageDto })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida exitosamente',
    type: FileResponseDto,
  })
  uploadProductImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }
    return this.fileService.uploadImage(id, file);
  }
}
