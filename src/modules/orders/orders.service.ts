import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './Entities/order.entity';
import { OrderDetail } from './Entities/orderDetails.entity';
import { Product } from '../products/Entities/products.entity';
import { CreateOrderDto } from './Dto/order.Dto';
import { Users } from '../users/Entyties/users.entity';
import {
  IUserResponseDto,
  ResponseUserDto,
} from '../users/interface/IUserResponseDto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderDetail)
    private readonly orderDetailRepo: Repository<OrderDetail>,

    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getOrder(
    id: string,
  ): Promise<Omit<Order, 'user'> & { user: IUserResponseDto }> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'orderDetail', 'orderDetail.products'],
    });

    if (!order) {
      throw new NotFoundException(`Orden con id ${id} no encontrada`);
    }

    const userDto = ResponseUserDto.toDTO(order.user);
    return {
      ...order,
      user: userDto,
    };
  }

  async addOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, products } = createOrderDto;
    const productIds = products.map((p) => p.id);

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }

    if (productIds.length === 0) {
      throw new BadRequestException('No se recibieron productos');
    }

    const productsFound = await this.productRepo.find({
      where: { id: In(productIds) },
      relations: ['orderDetails'],
    });

    if (!productsFound.length) {
      throw new NotFoundException('Productos no encontrados');
    }

    const availableProducts = productsFound.filter((p) => p.stock > 0);
    if (availableProducts.length !== productIds.length) {
      throw new BadRequestException(
        'Algunos productos no tienen stock disponible',
      );
    }

    let totalPrice = 0;
    for (const product of availableProducts) {
      totalPrice += Number(product.price);
      product.stock -= 1;
    }

    const orderDetail = this.orderDetailRepo.create({
      products: availableProducts,
      total: totalPrice,
    });

    const savedDetail = await this.orderDetailRepo.save(orderDetail);

    const order = this.orderRepo.create({
      user,
      orderDetail: savedDetail,
    });

    const savedOrder = await this.orderRepo.save(order);

    await this.productRepo.save(availableProducts);

    return savedOrder;
  }
}
