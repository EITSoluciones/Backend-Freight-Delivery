import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { from, Observable, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { LogsService } from 'src/logs/logs.service';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { User } from 'src/users/entities/user.entity';

type AuditedRequest = Request & { user?: User };

@Injectable()
export class AuditErrorInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuditedRequest>();
    const attemptedAction = this.getAttemptedAction(request.method);
    const module = this.getModule(request.originalUrl);

    return next.handle().pipe(
      catchError((error: unknown) => {
        if (request.user && attemptedAction && module) {
          return from(
            this.logsService
              .log(
                request.user as User,
                {
                  module,
                  action: LogAction.FAILED,
                  description: `Intento fallido de ${attemptedAction} en ${module}: ${this.getErrorMessage(error)}`,
                },
                request,
              )
              .catch(() => undefined),
          ).pipe(mergeMap(() => throwError(() => error)));
        }

        return throwError(() => error);
      }),
    );
  }

  private getAttemptedAction(method: string): string | null {
    if (method === 'POST') return 'crear';
    if (method === 'PATCH' || method === 'PUT') return 'actualizar';
    if (method === 'DELETE') return 'eliminar';

    return null;
  }

  private getModule(url: string): LogModule | null {
    const segments = url.split('?')[0].split('/');

    return (
      Object.values(LogModule).find((module) =>
        segments.includes(module.replaceAll('_', '-')),
      ) ?? null
    );
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpException)) {
      return 'Error interno del servidor.';
    }

    const response = error.getResponse();
    if (typeof response === 'string') return response;

    if (!response || typeof response !== 'object' || !('message' in response)) {
      return error.message;
    }

    const { message } = response as { message?: string | string[] };
    return Array.isArray(message)
      ? message.join(', ')
      : message || error.message;
  }
}
