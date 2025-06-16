import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './Dto/order.Dto';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async getOrder(id: string) {
    return this.ordersRepository.getOrder(id);
  }

  async addOrder(createOrderDto: CreateOrderDto) {
    const { userId, products } = createOrderDto;
    const productIds = products.map((p) => p.id);
    return this.ordersRepository.addOrder(userId, productIds);
  }
}
