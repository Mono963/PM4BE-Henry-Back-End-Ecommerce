import {
  Controller,
  Get,
  Param,
  HttpCode,
  BadRequestException,
  NotFoundException,
  ParseUUIDPipe,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../../guards/auth.guards';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Order')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiBearerAuth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getOrderById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const order = await this.ordersService.getOrder(id);
      if (!order) throw new NotFoundException('Orden no encontrada');
      return order;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('ID inválido o error al obtener la orden');
    }
  }
}
