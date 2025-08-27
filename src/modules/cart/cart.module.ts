import { forwardRef, Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/Entyties/users.entity';
import { Product } from '../products/Entities/products.entity';
import { AuthsModule } from '../auths/auths.module';
import { CartItem } from './entities/cart.item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Users, Product]),
    forwardRef(() => AuthsModule),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService, TypeOrmModule],
})
export class CartModule {}
