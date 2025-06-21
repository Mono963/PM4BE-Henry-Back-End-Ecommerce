import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { User } from './Entities/user.entity';
import { AuthsModule } from '../auths/auths.module';
import { requiresAuth } from 'express-openid-connect';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthsModule)],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(requiresAuth()).forRoutes('users/auth0');
  }
}
