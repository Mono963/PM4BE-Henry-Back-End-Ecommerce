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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './Dto/products.Dto';
import { AuthGuard } from '../auths/auth.gurds';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @HttpCode(200)
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

  @Get(':id')
  @HttpCode(200)
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

  @Post('seeder')
  @HttpCode(201)
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

  @Post()
  @HttpCode(201)
  // @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createProduct(@Body() dto: CreateProductDto) {
    try {
      return await this.productsService.createProduct(dto);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al crear el producto');
    }
  }

  @Put(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
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

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
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
