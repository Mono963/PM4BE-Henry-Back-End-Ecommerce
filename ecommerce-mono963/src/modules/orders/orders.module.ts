import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './Entities/order.entity';
import { OrderDetail } from './Entities/orderDetails.entity';
import { User } from '../user/Entities/user.entity';
import { Product } from '../products/Entities/products.entity';
import { AuthsModule } from '../auths/auths.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetail, User, Product]),
    forwardRef(() => AuthsModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
