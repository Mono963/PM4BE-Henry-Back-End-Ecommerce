import { Users } from '../Entyties/users.entity';

export interface IUserResponseDto {
  id: string;
  name: string;
  email: string;
  birthdate: Date;
  phone: number;
  address: string; // Cambiado de string | IAddress a solo string
  username: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  createdAt: Date;
  deletedAt: Date | null;
  orders?: IOrderResponseDto[];
  cart?: ICartResponseDto;
}

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
  };
}

export enum OrderStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PROCESSED = 'processed',
  FINALIZED = 'finalized',
}

export interface IOrderResponseDto {
  id: string;
  date: Date;
  status: OrderStatus;
  orderDetail: any; // Mantener como any por ahora
}

export interface ICartResponseDto {
  id: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items: any[]; // Mantener como any[] por ahora
}

export class ResponseUserDto {
  static toDTO(user: Users): IUserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      birthdate: user.birthdate,
      phone: user.phone,
      address: user.address || '', // Manejar posibles valores null
      username: user.username,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      createdAt: user.createdAt ?? new Date(),
      deletedAt: user.deletedAt,
      orders:
        user.orders?.map((order) => ({
          id: order.id,
          date: order.date,
          status: order.status as OrderStatus,
          orderDetail: order.orderDetail,
        })) ?? [],
      cart: user.cart
        ? {
            id: user.cart.id,
            total: user.cart.total,
            createdAt: user.cart.createdAt,
            updatedAt: user.cart.updatedAt,
            items: user.cart.items ?? [],
          }
        : undefined, // Cambiado a undefined en lugar de objeto vacío
    };
  }

  static toDTOList(users: Users[]): IUserResponseDto[] {
    return users.map((user) => this.toDTO(user));
  }
}

export interface IUserResponseWithAdmin extends IUserResponseDto {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  password: string;
}

export class ResponseUserWithAdminDto {
  static toDTO(user: Users): IUserResponseWithAdmin {
    return {
      ...ResponseUserDto.toDTO(user),
      isSuperAdmin: user.isSuperAdmin,
      isAdmin: user.isAdmin,
      password: user.password,
    };
  }

  static toDTOList(users: Users[]): IUserResponseWithAdmin[] {
    return users.map((user) => this.toDTO(user));
  }
}
