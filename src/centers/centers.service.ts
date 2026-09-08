import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  PaginatedResponse,
  SuccessResponseDto,
} from 'src/common/dto/success-response.dto';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { LogsService } from 'src/logs/logs.service';
import { User } from 'src/users/entities/user.entity';
import { CreateCenterDto } from './dto/create-center.dto';
import { ImportCentersDto } from './dto/import-centers.dto';
import { UpdateCenterDto } from './dto/update-center.dto';
import { Center } from './entities/center.entity';
import { CentersRepository } from './repositories/centers.repository';

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
    const centersToCreate = importCentersDto.centers.map((center) => ({
      ...center,
      code: center.code.trim().toUpperCase(),
    }));
    const codes = centersToCreate.map((center) => center.code);
    const duplicatedCodes = codes.filter(
      (code, index) => codes.indexOf(code) !== index,
    );

    if (duplicatedCodes.length) {
      throw new BadRequestException(
        `Hay códigos de centro duplicados en la carga: ${[...new Set(duplicatedCodes)].join(', ')}.`,
      );
    }

    const existingCenters = await this.centersRepository.findByCodes(codes);

    if (existingCenters.length) {
      throw new BadRequestException(
        `Ya existen centros con los códigos: ${existingCenters.map((center) => center.code).join(', ')}.`,
      );
    }

    try {
      const savedCenters = await this.centersRepository.createMany(centersToCreate);

      await this.logsService.log(currentUser || null, {
        module: LogModule.CENTERS,
        action: LogAction.CREATE,
        description: `Carga masiva de centros: ${savedCenters.length} registros creados.`,
        newData: { count: savedCenters.length, codes },
      });

      return new SuccessResponseDto(
        true,
        'Centros cargados exitosamente!',
        savedCenters,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  getImportTemplate(): SuccessResponseDto<{ centers: CreateCenterDto[] }> {
    return new SuccessResponseDto(
      true,
      'Plantilla de centros obtenida exitosamente!',
      {
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
