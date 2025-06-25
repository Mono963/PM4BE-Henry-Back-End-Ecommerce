import { Category } from 'src/modules/category/Entities/category.entity';
import { File } from 'src/modules/file/entities/file.entity';
import { OrderDetail } from 'src/modules/orders/Entities/orderDetails.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  ManyToOne,
  JoinTable,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  imgUrls: string[];

  @OneToMany(() => File, (file) => file.product)
  files: File[];

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @ManyToMany(() => OrderDetail, (detail) => detail.products)
  @JoinTable()
  orderDetails: OrderDetail[];
}
