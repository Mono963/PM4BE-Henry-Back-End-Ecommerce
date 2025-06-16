import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Order } from './Entities/order.entity';
import { OrderDetail } from './Entities/orderDetails.entity';
import { User } from '../user/Entities/user.entity';
import { Product } from '../products/Entities/products.entity';

@Injectable()
export class OrdersRepository {
  private orderRepo: Repository<Order>;
  private orderDetailRepo: Repository<OrderDetail>;
  private userRepo: Repository<User>;
  private productRepo: Repository<Product>;

  constructor(private dataSource: DataSource) {
    this.orderRepo = this.dataSource.getRepository(Order);
    this.orderDetailRepo = this.dataSource.getRepository(OrderDetail);
    this.userRepo = this.dataSource.getRepository(User);
    this.productRepo = this.dataSource.getRepository(Product);
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'detail', 'detail.products'],
    });
    if (!order) throw new NotFoundException(`Orden con id ${id} no encontrada`);
    return order;
  }

  async addOrder(userId: string, productIds: string[]): Promise<Order> {
    // Buscar usuario
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user)
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);

    if (productIds.length === 0)
      throw new BadRequestException('No se recibieron productos');

    // Buscar productos que tengan stock > 0 y que estén en productIds
    const products = await this.productRepo.find({
      where: { id: In(productIds) },
      relations: ['orderDetails'],
    });

    if (!products.length)
      throw new NotFoundException('Productos no encontrados');

    // Validar stock y filtrar productos sin stock
    const availableProducts = products.filter((p) => p.stock > 0);
    if (availableProducts.length !== productIds.length) {
      throw new BadRequestException(
        'Algunos productos no tienen stock disponible',
      );
    }

    // Calcular precio total y reducir stock en cada producto
    let totalPrice = 0;
    for (const product of availableProducts) {
      totalPrice += Number(product.price);
      product.stock -= 1;
    }

    // Crear detalle de orden con los productos y precio total
    const orderDetail = new OrderDetail();
    orderDetail.products = availableProducts;
    orderDetail.price = totalPrice;

    // Guardar detalle (sin orden aún)
    const savedDetail = await this.orderDetailRepo.save(orderDetail);

    // Crear orden con usuario y detalle
    const order = new Order();
    order.user = user;
    order.detail = savedDetail;

    // Guardar orden
    const savedOrder = await this.orderRepo.save(order);

    // Actualizar productos con stock modificado
    await this.productRepo.save(availableProducts);

    return savedOrder;
  }
}
