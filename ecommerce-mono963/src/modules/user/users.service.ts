import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './Entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateUserDto,
  UpdateUserDto,
  IUserResponseDto,
  ResponseUserDto,
} from './Dto/user.Dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUsers(page?: number, limit?: number): Promise<User[]> {
    if (page && limit) {
      return this.userRepository.find({
        skip: (page - 1) * limit,
        take: limit,
      });
    } else {
      return this.userRepository.find();
    }
  }

  async getUserServiceById(id: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'order')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.phone',
        'user.country',
        'user.address',
        'user.city',
        'user.isAdmin',
        'order.id',
        'order.date',
      ])
      .where('user.id = :id', { id: String(id) })
      .getOne();

    if (!user) return null;

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password'],
    });
  }

  async createUserService(dto: CreateUserDto): Promise<IUserResponseDto> {
    const userEntity = this.userRepository.create({
      ...dto,
      isAdmin: false,
    });
    const savedUser = await this.userRepository.save(userEntity);
    return ResponseUserDto.toDTO(savedUser);
  }

  async updateUserService(
    id: string,
    dto: Partial<UpdateUserDto>,
  ): Promise<IUserResponseDto> {
    if ('isAdmin' in dto) delete dto.isAdmin;

    await this.userRepository.update({ id }, dto);
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['orders'],
    });
    if (!updatedUser) throw new Error(`Usuario con id ${id} no encontrado`);
    return ResponseUserDto.toDTO(updatedUser);
  }

  async deleteUserService(id: number | string): Promise<{ id: string }> {
    const result = await this.userRepository.delete({ id: String(id) });
    if (!result.affected) throw new Error(`Usuario con id ${id} no encontrado`);
    return { id: String(id) };
  }
}
