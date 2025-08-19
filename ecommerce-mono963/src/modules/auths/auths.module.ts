import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

import { UsersModule } from '../user/users.module';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { AuthGuard } from '../../guards/auth.guards';

dotenv.config({ path: '.env.development' });

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: process.env.SUPABASE_JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthsService, AuthGuard],
  controllers: [AuthsController],
  exports: [JwtModule, AuthGuard],
})
export class AuthsModule {}
