import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class DBErrorHandlerService {

    handleDBErrors(error: any): never {

        // Clave duplicada (violación de UNIQUE)
        if (error.errno === 1062) {
            const duplicateValue = error.sqlMessage.match(/'([^']+)'/);
            throw new BadRequestException(`Valor duplicado: ${duplicateValue ? duplicateValue[1] : 'Valor duplicado.'}.`);
        }

        // Insert/Update con llave foránea que no existe
        if (error.errno === 1452) throw new BadRequestException('Violación de llave foránea: el valor relacionado no existe.');


        // No se puede eliminar o actualizar por tener registros dependientes
        if (error.errno === 1451) throw new BadRequestException('El registro no puede eliminarse o actualizarse porque tiene datos relacionados.');

        // Campo no existente
        if (error.errno === 1054) throw new BadRequestException('Campo desconocido. Verifica nombres de columnas.');

        // Valor con formato incorrecto
        if (error.errno === 1292) throw new BadRequestException('Valor con formato incorrecto para el tipo de dato.');

        // Dato demasiado grande para la columna
        if (error.errno === 1406) throw new BadRequestException('El valor excede el tamaño permitido para la columna.');

        // Log general para debugging
        console.error('DB Error:', error);

        // Error genérico
        throw new InternalServerErrorException('Error inesperado en la base de datos.');
    }
    
}
