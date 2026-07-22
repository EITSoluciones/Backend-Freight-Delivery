import { Global, Module } from '@nestjs/common';
import { DBErrorHandlerService } from './database/db-error-handler.service';
import { ResponseInterceptor } from './interceptors/response.interceptor';

@Global() //Convierte el módulo en global para no tener que importarlo (todo lo que exponga export estará disponible automáticamente)
@Module({
  providers: [DBErrorHandlerService, ResponseInterceptor],
  exports: [DBErrorHandlerService, ResponseInterceptor], //Exponer para otros módulos
})
export class CommonModule {}
