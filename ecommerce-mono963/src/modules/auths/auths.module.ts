import { forwardRef, Module } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { UsersModule } from '../user/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [AuthsService],
  controllers: [AuthsController],
})
export class AuthModule {}
