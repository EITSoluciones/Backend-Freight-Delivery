import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((response) => {

                // Si el servicio devolvió un objeto completo (message, data, pagination)
                if (typeof response === 'object' && response !== null) {
                    return {
                        success: true,
                        message: response.message ?? 'Operación exitosa',
                        data: response.data ?? null,
                        pagination: response.pagination ?? undefined,
                    };
                }

                // Si no es un objeto (ej. regresa simplemente un array o string)
                return {
                    success: true,
                    message: 'Operación exitosa',
                    data: response,
                };
            }),
        );
    }
}