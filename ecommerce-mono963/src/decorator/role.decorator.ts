import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/modules/user/Entities/user.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
