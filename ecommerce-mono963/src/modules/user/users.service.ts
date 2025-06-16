import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './Entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateUserDto,
  UpdateUserDto,
  IUserResponsDto,
  ResponseProductsDto,
} from './Dto/user.Dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUsers(page?: number, limit?: number): Promise<IUserResponsDto[]> {
    let users: User[];

    if (page && limit) {
      users = await this.userRepository.find({
        skip: (page - 1) * limit,
        take: limit,
      });
    } else {
      users = await this.userRepository.find();
    }

    return ResponseProductsDto.toDTOList(users);
  }

  async getUserServiceById(id: string): Promise<IUserResponsDto | null> {
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
        'order.id',
        'order.date',
      ])
      .where('user.id = :id', { id: String(id) })
      .getOne();

    if (!user) return null;

    return ResponseProductsDto.toDTO(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password'], // ¡Incluí password!
    });
  }

  async createUserService(dto: CreateUserDto): Promise<IUserResponsDto> {
    const user = this.userRepository.create(dto);
    const savedUser = await this.userRepository.save(user);
    return ResponseProductsDto.toDTO(savedUser);
  }

  async updateUserService(
    id: number | string,
    dto: Partial<UpdateUserDto>,
  ): Promise<IUserResponsDto> {
    await this.userRepository.update({ id: String(id) }, dto);
    const updatedUser = await this.userRepository.findOneBy({ id: String(id) });
    if (!updatedUser) throw new Error(`Usuario con id ${id} no encontrado`);
    return ResponseProductsDto.toDTO(updatedUser);
  }

  async deleteUserService(id: number | string): Promise<{ id: string }> {
    const result = await this.userRepository.delete({ id: String(id) });
    if (!result.affected) throw new Error(`Usuario con id ${id} no encontrado`);
    return { id: String(id) };
  }
}
