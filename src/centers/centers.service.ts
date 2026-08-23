import { Injectable, NotFoundException } from '@nestjs/common';
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

      this.logsService.log(currentUser || null, {
        module: LogModule.CENTERS,
        action: LogAction.CREATE,
        entityUuid: savedCenter.uuid,
        entityName: savedCenter.name,
        description: `Centro creado: ${savedCenter.name}`,
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

      this.logsService.log(currentUser || null, {
        module: LogModule.CENTERS,
        action: LogAction.UPDATE,
        entityUuid: updatedCenter.uuid,
        entityName: updatedCenter.name,
        description: `Centro actualizado: ${updatedCenter.name}`,
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

    this.logsService.log(currentUser || null, {
      module: LogModule.CENTERS,
      action: LogAction.DELETE,
      entityUuid: center.uuid,
      entityName: center.name,
      description: `Centro eliminado: ${center.name}`,
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
