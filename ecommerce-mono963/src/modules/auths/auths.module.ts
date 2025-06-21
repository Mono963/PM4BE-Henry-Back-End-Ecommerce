import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../user/users.module';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { AuthGuard } from 'src/guards/auth.guards';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthsService, AuthGuard],
  controllers: [AuthsController],
  exports: [JwtModule, AuthGuard],
})
export class AuthsModule {}
