/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './Entities/user.entity';
import { CreateUserDto, UpdateUserDto, ResponseUserDto } from './Dto/user.Dto';

const mockUserArray: User[] = [
  {
    id: 'uuid1',
    name: 'Mono',
    email: 'mono@test.com',
    password: '123456',
    phone: 123,
    country: 'AR',
    address: 'fake street',
    city: 'BS AS',
    isAdmin: true,
    orders: [],
  },
  {
    id: 'uuid2',
    name: 'Mion',
    email: 'mion@test.com',
    password: '123456',
    phone: 1234,
    country: 'AR',
    address: 'fake street',
    city: 'Rosario, Santa Fe',
    isAdmin: false,
    orders: [],
  },
];

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
});

describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));

    mockQueryBuilder.leftJoinAndSelect.mockClear();
    mockQueryBuilder.select.mockClear();
    mockQueryBuilder.where.mockClear();
    mockQueryBuilder.getOne.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      repo.find.mockResolvedValue(mockUserArray);
      const result = await service.getUsers(1, 2);
      expect(repo.find).toHaveBeenCalledWith({ skip: 0, take: 2 });
      expect(result).toEqual(mockUserArray);
    });

    it('should return all users when no pagination', async () => {
      repo.find.mockResolvedValue(mockUserArray);
      const result = await service.getUsers();
      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual(mockUserArray);
    });
  });

  describe('getUserServiceById', () => {
    it('should return user with orders', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUserArray[0]);
      const result = await service.getUserServiceById('1');
      expect(result).toEqual(mockUserArray[0]);
    });

    it('should return null if user not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      const result = await service.getUserServiceById('not-found');
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const user = mockUserArray[0];
      repo.findOne.mockResolvedValue(user);
      const result = await service.findByEmail(user.email);
      expect(result).toEqual(user);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
        select: ['id', 'name', 'email', 'password', 'isAdmin'],
      });
    });
  });

  describe('createUserService', () => {
    it('should create and return user dto', async () => {
      const dto: CreateUserDto = {
        name: 'Monoo',
        email: 'monoo@test.com',
        password: '123456',
        phone: 1235,
        country: 'AR',
        address: 'fake street',
        city: 'BS AS',
      };

      const saved: User = {
        ...dto,
        id: 'uuid3',
        isAdmin: false,
        orders: [],
        country: dto.country ?? '',
        city: dto.city ?? '',
      };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.createUserService(dto);
      expect(result).toEqual(ResponseUserDto.toDTO(saved));
      expect(repo.create).toHaveBeenCalledWith({ ...dto, isAdmin: false });
    });
  });

  describe('updateUserService', () => {
    it('should update and return updated user dto', async () => {
      const dto: UpdateUserDto = { name: 'Nuevo Mono' };
      const updated: User = {
        ...mockUserArray[0],
        ...dto,
        orders: [],
        country: mockUserArray[0].country,
        city: mockUserArray[0].city,
      };

      repo.findOne.mockResolvedValue(updated);
      const result = await service.updateUserService('1', dto);
      expect(result).toEqual(ResponseUserDto.toDTO(updated));
      expect(repo.update).toHaveBeenCalledWith({ id: '1' }, dto);
    });

    it('should throw if user not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.updateUserService('404', {})).rejects.toThrow(
        'Usuario con id 404 no encontrado',
      );
    });
  });

  describe('deleteUserService', () => {
    it('should delete user and return id', async () => {
      repo.delete.mockResolvedValue({ affected: 1, raw: [] });
      const result = await service.deleteUserService('1');
      expect(result).toEqual({ id: '1' });
    });

    it('should throw if user not found', async () => {
      repo.delete.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.deleteUserService('404')).rejects.toThrow(
        'Usuario con id 404 no encontrado',
      );
    });
  });
});
