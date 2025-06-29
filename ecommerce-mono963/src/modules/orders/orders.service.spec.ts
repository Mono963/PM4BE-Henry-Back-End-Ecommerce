import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { Repository, In } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './Entities/order.entity';
import { OrderDetail } from './Entities/orderDetails.entity';
import { User } from '../user/Entities/user.entity';
import { Product } from '../products/Entities/products.entity';
import { CreateOrderDto } from './Dto/order.Dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ResponseUserDto } from '../user/Dto/user.Dto';

describe('OrdersService', () => {
  let service: OrdersService;

  let orderRepo: Partial<Record<keyof Repository<Order>, jest.Mock>>;
  let orderDetailRepo: Partial<
    Record<keyof Repository<OrderDetail>, jest.Mock>
  >;
  let userRepo: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let productRepo: Partial<Record<keyof Repository<Product>, jest.Mock>>;

  beforeEach(async () => {
    orderRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    orderDetailRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };
    userRepo = {
      findOneBy: jest.fn(),
    };
    productRepo = {
      find: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(OrderDetail), useValue: orderDetailRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('getOrder', () => {
    it('debería devolver la orden con user DTO si existe', async () => {
      const mockUser = { id: 'u1', name: 'Mono' };
      const mockOrder = {
        id: 'o1',
        user: mockUser,
        detail: {},
      };
      (orderRepo.findOne as jest.Mock).mockResolvedValue(mockOrder);

      const spyDto = jest.spyOn(ResponseUserDto, 'toDTO').mockReturnValue({
        id: 'u1',
        name: 'Mono',
        email: 'mono@example.com',
        phone: 123456789,
        orders: [],
      });

      const result = await service.getOrder('o1');

      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'o1' },
        relations: ['user', 'detail', 'detail.products'],
      });
      expect(spyDto).toHaveBeenCalledWith(mockUser);
      expect(result.user).toMatchObject({ id: 'u1', name: 'Mono' });
    });

    it('debería lanzar NotFoundException si no existe la orden', async () => {
      (orderRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getOrder('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addOrder', () => {
    const createOrderDto: CreateOrderDto = {
      userId: 'user-1',
      products: [{ id: 'prod-1' }, { id: 'prod-2' }],
    };

    const mockUser = { id: 'user-1' };
    const mockProducts = [
      { id: 'prod-1', stock: 1, price: 10 },
      { id: 'prod-2', stock: 1, price: 20 },
    ];

    it('debería crear una orden correctamente', async () => {
      userRepo.findOneBy!.mockResolvedValue(mockUser);
      productRepo.find!.mockResolvedValue(mockProducts);

      orderDetailRepo.create!.mockImplementation(
        (dto: Partial<OrderDetail>): OrderDetail => dto as OrderDetail,
      );
      orderDetailRepo.save!.mockImplementation(
        async (dto: OrderDetail): Promise<OrderDetail> =>
          Promise.resolve({ ...dto, id: 'detail-1' }),
      );

      orderRepo.create!.mockImplementation(
        (dto: Partial<Order>): Order => dto as Order,
      );
      orderRepo.save!.mockImplementation(
        async (dto: Order): Promise<Order> =>
          Promise.resolve({ ...dto, id: 'order-1' }),
      );

      productRepo.save!.mockImplementation(
        async (products: Product[]): Promise<Product[]> =>
          Promise.resolve(products),
      );

      const result = await service.addOrder(createOrderDto);

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: 'user-1' });
      expect(productRepo.find).toHaveBeenCalledWith({
        where: { id: In(['prod-1', 'prod-2']) },
        relations: ['orderDetails'],
      });
      expect(orderDetailRepo.create).toHaveBeenCalledWith({
        products: mockProducts,
        price: 30,
      });
      expect(orderDetailRepo.save).toHaveBeenCalled();
      expect(orderRepo.create).toHaveBeenCalled();
      expect(orderRepo.save).toHaveBeenCalled();
      expect(productRepo.save).toHaveBeenCalledWith([
        { id: 'prod-1', stock: 0, price: 10 },
        { id: 'prod-2', stock: 0, price: 20 },
      ]);
      expect(result).toHaveProperty('id', 'order-1');
    });

    it('debería lanzar NotFoundException si usuario no existe', async () => {
      userRepo.findOneBy!.mockResolvedValue(null);
      await expect(service.addOrder(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar BadRequestException si no hay productos en el pedido', async () => {
      userRepo.findOneBy!.mockResolvedValue({ id: 'user-1' });
      await expect(
        service.addOrder({ userId: 'user-1', products: [] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si no se encuentran productos', async () => {
      userRepo.findOneBy!.mockResolvedValue(mockUser);
      productRepo.find!.mockResolvedValue([]);
      await expect(service.addOrder(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar BadRequestException si algún producto no tiene stock', async () => {
      userRepo.findOneBy!.mockResolvedValue(mockUser);
      productRepo.find!.mockResolvedValue([
        { id: 'prod-1', stock: 1, price: 10 },
        { id: 'prod-2', stock: 0, price: 20 },
      ]);
      await expect(service.addOrder(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
