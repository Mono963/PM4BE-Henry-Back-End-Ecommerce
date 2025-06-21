import { Order } from 'src/modules/orders/Entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column('int')
  phone: number;

  @Column({ length: 50, nullable: true })
  country: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;
}
