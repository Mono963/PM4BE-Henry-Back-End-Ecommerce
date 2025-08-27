import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './Dto/products.Dto';
import { AuthGuard } from '../../guards/auth.guards';
import { RoleGuard } from '../../guards/auth.guards.admin';
import { Roles, UserRole } from '../../decorator/role.decorator';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth()
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNumber = page ? Number(page) : undefined;
      const limitNumber = limit ? Number(limit) : undefined;
      return await this.productsService.getProducts(pageNumber, limitNumber);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al obtener los productos');
    }
  }

  @ApiBearerAuth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getProductById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const product = await this.productsService.getProductById(id);
      if (!product) throw new NotFoundException('Producto no encontrado');
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        'ID inválido o error al buscar el producto',
      );
    }
  }

  @ApiBearerAuth()
  @Post('seeder')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async seedProducts() {
    try {
      return await this.productsService.seedProducts();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al precargar los productos',
      );
    }
  }

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createProduct(@Body() dto: CreateProductDto) {
    try {
      return await this.productsService.createProduct(dto);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al crear el producto');
    }
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiBody({ type: UpdateProductDto })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    try {
      const updated = await this.productsService.updateProduct(id, dto);
      if (!updated) throw new NotFoundException('Producto no encontrado');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Error al actualizar el producto');
    }
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const deleted = await this.productsService.deleteProduct(id);
      if (!deleted) throw new NotFoundException('Producto no encontrado');
      return deleted;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Error al eliminar el producto');
    }
  }
}
