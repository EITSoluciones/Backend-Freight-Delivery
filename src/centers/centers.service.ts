import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  PaginatedResponse,
  SuccessResponseDto,
} from 'src/common/dto/success-response.dto';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validateImportRow } from 'src/common/import/import-field-validator';
import { ColumnMetadata } from 'src/common/interfaces/column-metadata.interface';
import { ImportRowError } from 'src/common/interfaces/import-row-error.interface';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { LogsService } from 'src/logs/logs.service';
import { User } from 'src/users/entities/user.entity';
import { CreateCenterDto } from './dto/create-center.dto';
import { ImportCentersDto } from './dto/import-centers.dto';
import { UpdateCenterDto } from './dto/update-center.dto';
import { Center } from './entities/center.entity';
import { CentersRepository } from './repositories/centers.repository';
import { CENTERS_IMPORT_METADATA } from './constants/centers-import-metadata';

@Injectable()
export class CentersService {
  constructor(
    private readonly centersRepository: CentersRepository,
    private readonly logsService: LogsService,
    private readonly dbErrorHandler: DBErrorHandlerService,
  ) {}

  async create(
    createCenterDto: CreateCenterDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Center>> {
    try {
      const center = this.centersRepository.create(createCenterDto);
      const savedCenter = await this.centersRepository.save(center);

      await this.logsService.log(currentUser || null, {
        module: LogModule.CENTERS,
        action: LogAction.CREATE,
        description: `Centro creado: ${savedCenter.name}. UUID: ${savedCenter.uuid}`,
        newData: createCenterDto,
      });

      return new SuccessResponseDto(
        true,
        'Centro creado exitosamente!',
        savedCenter,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Center>> {
    const { limit = 10, page = 1 } = paginationDto;
    const [centers, total] =
      await this.centersRepository.findAll(paginationDto);

    return PaginatedResponse.create(
      centers,
      total,
      page,
      limit,
      'Centros obtenidos exitosamente!',
    );
  }

  async getCentersCatalog(): Promise<
    SuccessResponseDto<{ uuid: string; code: string; name: string }[]>
  > {
    const centers = await this.centersRepository.findActive();

    return new SuccessResponseDto(
      true,
      'Catálogo de centros obtenido exitosamente!',
      centers.map(({ uuid, code, name }) => ({ uuid, code, name })),
    );
  }

  async import(
    importCentersDto: ImportCentersDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Center[]>> {
    const centersToImport = importCentersDto.centers.map((center) => ({
      ...center,
      code: center.code?.toString().trim().toUpperCase() ?? '',
    }));

    const errors: ImportRowError[] = [];
    const codesInFile = new Map<string, number>();

    centersToImport.forEach((center, index) => {
      const row = index + 2;

      validateImportRow(center as Record<string, unknown>, row, CENTERS_IMPORT_METADATA, errors);

      // Duplicate code within the file
      if (center.code && center.code.length <= 10) {
        const firstRow = codesInFile.get(center.code);
        if (firstRow !== undefined) {
          errors.push({ row, field: 'code', value: center.code, observation: `El código "${center.code}" ya aparece en la fila ${firstRow}` });
        } else {
          codesInFile.set(center.code, row);
        }
      }
    });

    const uniqueCodes = [...codesInFile.keys()];
    if (uniqueCodes.length) {
      const existingCenters = await this.centersRepository.findByCodes(uniqueCodes);
      if (existingCenters.length) {
        const existingCodesSet = new Set(existingCenters.map((c) => c.code));
        centersToImport.forEach((center, index) => {
          const row = index + 2;
          // Solo reportar error de DB en la primera ocurrencia del código en el archivo
          if (center.code && codesInFile.get(center.code) === row && existingCodesSet.has(center.code)) {
            errors.push({
              row,
              field: 'code',
              value: center.code,
              observation: `Ya existe un centro con el código "${center.code}"`,
            });
          }
        });
      }
    }

    if (errors.length) {
      throw new BadRequestException({
        message: `Se encontraron ${errors.length} error${errors.length !== 1 ? 'es' : ''} en la carga. No se insertó ningún registro.`,
        errors: errors.sort((a, b) => a.row - b.row),
      });
    }

    try {
      const savedCenters = await this.centersRepository.createMany(centersToImport);

      await this.logsService.log(currentUser || null, {
        module: LogModule.CENTERS,
        action: LogAction.CREATE,
        description: `Carga masiva de centros: ${savedCenters.length} registros creados.`,
        newData: { count: savedCenters.length, codes: uniqueCodes },
      });

      return new SuccessResponseDto(true, 'Centros cargados exitosamente!', savedCenters);
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  getImportTemplate(): SuccessResponseDto<{ centers: CreateCenterDto[]; metadata: ColumnMetadata[] }> {
    return new SuccessResponseDto(
      true,
      'Plantilla de centros obtenida exitosamente!',
      {
        metadata: CENTERS_IMPORT_METADATA,
        centers: [
          {
            code: 'CEDIS-001',
            name: 'Centro de Distribución Norte',
            description: 'Centro principal de operaciones',
            latitude: 19.427,
            longitude: -99.1677,
            street: 'Avenida Reforma',
            internal_number: '12',
            external_number: '123',
            neighborhood: 'Juárez',
            district: 'Cuauhtémoc',
            city: 'Ciudad de México',
            state: 'Ciudad de México',
            country: 'México',
            postal_code: '06600',
            is_active: true,
          },
        ],
      },
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<Center>> {
    return new SuccessResponseDto(
      true,
      'Centro encontrado!',
      await this.getCenterByUuid(uuid),
    );
  }

  async update(
    uuid: string,
    updateCenterDto: UpdateCenterDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Center>> {
    const center = await this.getCenterByUuid(uuid);
    const oldData = { ...center };

    Object.assign(center, updateCenterDto);

    try {
      const updatedCenter = await this.centersRepository.save(center);

      await this.logsService.log(currentUser || null, {
        module: LogModule.CENTERS,
        action: LogAction.UPDATE,
        description: `Centro actualizado: ${updatedCenter.name}. UUID: ${updatedCenter.uuid}`,
        oldData,
        newData: updateCenterDto,
      });

      return new SuccessResponseDto(
        true,
        'Centro actualizado exitosamente!',
        updatedCenter,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Center>> {
    const center = await this.getCenterByUuid(uuid);
    await this.centersRepository.softDeleteByUuid(uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.CENTERS,
      action: LogAction.DELETE,
      description: `Centro eliminado: ${center.name}. UUID: ${center.uuid}`,
      oldData: { code: center.code, name: center.name },
    });

    return new SuccessResponseDto(
      true,
      'Centro eliminado exitosamente!',
      center,
    );
  }

  async getCenterByUuid(uuid: string): Promise<Center> {
    const center = await this.centersRepository.findByUuid(uuid);

    if (!center) {
      throw new NotFoundException(`Centro con uuid ${uuid} no encontrado!`);
    }

    return center;
  }
}
