import { Test } from '@nestjs/testing';
import { UserService } from './users.service';

describe('userService', () => {
  it('create an instancia of AuthService', async () => {
    const mockUserService: Partial<UserService> = {};

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    const userService = module.get<UserService>(UserService);
    expect(userService).toBeDefined();
  });
});
