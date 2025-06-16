import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { Order } from './Entities/order.entity';
import { OrderDetail } from './Entities/orderDetails.entity';
import { User } from '../user/Entities/user.entity';
import { Product } from '../products/Entities/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail, User, Product])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
