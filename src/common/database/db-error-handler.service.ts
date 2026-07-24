import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class DBErrorHandlerService {
  handleDBErrors(error: unknown): never {
    if (error instanceof HttpException) throw error;

    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as {
        errno?: number;
        code?: string;
        detail?: string;
        sqlMessage?: string;
      };

      if (driverError.errno === 1062 || driverError.code === '23505') {
        throw new ConflictException(
          driverError.detail || driverError.sqlMessage || 'Registro duplicado.',
        );
      }

      if (driverError.errno === 1452 || driverError.code === '23503') {
        throw new BadRequestException(
          'Violación de llave foránea: el valor relacionado no existe.',
        );
      }

      if (driverError.errno === 1451) {
        throw new BadRequestException(
          'El registro no puede eliminarse o actualizarse porque tiene datos relacionados.',
        );
      }

      if (driverError.errno === 1054) {
        throw new BadRequestException(
          'Campo desconocido. Verifica nombres de columnas.',
        );
      }

      if (driverError.errno === 1292) {
        throw new BadRequestException(
          'Valor con formato incorrecto para el tipo de dato.',
        );
      }

      if (driverError.errno === 1406) {
        throw new BadRequestException(
          'El valor excede el tamaño permitido para la columna.',
        );
      }
    }

    console.error('DB Error:', error);
    throw new InternalServerErrorException(
      'Error del Servidor. Porfavor contacte al administrador del sistema!',
    );
  }
}
