import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class DateAdderInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const now = new Date();
    console.log(now);
    const formatDate = now.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const request = context.switchToHttp().getRequest<Request>();
    request.now = formatDate;
    return next.handle();
  }
}
