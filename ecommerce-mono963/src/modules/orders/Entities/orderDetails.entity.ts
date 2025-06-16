import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/modules/products/Entities/products.entity';

@Entity('order_details')
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @OneToOne(() => Order, (order) => order.detail)
  order: Order;

  @ManyToMany(() => Product, (product) => product.orderDetails, { eager: true })
  @JoinTable()
  products: Product[];
}
