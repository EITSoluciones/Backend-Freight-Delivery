import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ModuleCategory } from './entities/module-category.entity';
import { CreateModuleCategoryDto } from './dto/create-module-category.dto';
import { UpdateModuleCategoryDto } from './dto/update-module-category.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import {
  PaginatedResponse,
  SuccessResponseDto,
} from 'src/common/dto/success-response.dto';
import { ModuleCategoriesRepository } from './repositories/module-categories.repository';
import { ModulesRepository } from './repositories/modules.repository';
import { LogsService } from 'src/logs/logs.service';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ModuleCategoriesService {
  constructor(
    private readonly moduleCategoriesRepository: ModuleCategoriesRepository,
    private readonly modulesRepository: ModulesRepository,
    private readonly dbErrorHandler: DBErrorHandlerService,
    private readonly logsService: LogsService,
  ) {}

  async create(
    createModuleCategoryDto: CreateModuleCategoryDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<ModuleCategory>> {
    const moduleCategory = this.moduleCategoriesRepository.create(
      createModuleCategoryDto,
    );
    const savedModuleCategory =
      await this.moduleCategoriesRepository.save(moduleCategory);

    await this.logsService.log(currentUser || null, {
      module: LogModule.MODULE_CATEGORIES,
      action: LogAction.CREATE,
      description: `Categoría creada: ${savedModuleCategory.name}. UUID: ${savedModuleCategory.uuid}`,
      newData: createModuleCategoryDto,
    });

    return new SuccessResponseDto(
      true,
      'Categoría  Creada Exitosamente!',
      savedModuleCategory,
    );
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<ModuleCategory>> {
    const { limit = 10, page = 1, is_active } = paginationDto;

    const [moduleCategories, total] =
      await this.moduleCategoriesRepository.findAll(paginationDto);

    return PaginatedResponse.create(
      moduleCategories,
      total,
      page,
      limit,
      'Categorías obtenidas exitosamente!',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<ModuleCategory>> {
    const moduleCategory =
      await this.moduleCategoriesRepository.findByUuid(uuid);

    if (!moduleCategory) {
      throw new NotFoundException(
        `La categoría con uuid ${uuid} no se encontró!`,
      );
    }

    return new SuccessResponseDto(
      true,
      'Categoría Encontrada!',
      moduleCategory,
    );
  }

  async update(
    uuid: string,
    updateModuleCategoryDto: UpdateModuleCategoryDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<ModuleCategory>> {
    const moduleCategoryToUpdate =
      await this.moduleCategoriesRepository.findByUuid(uuid);

    if (!moduleCategoryToUpdate)
      throw new NotFoundException(
        `Categoría con uuid: ${uuid} no encontrado`,
      );

    const modules = await this.modulesRepository.findByCategoryOrdered(
      moduleCategoryToUpdate.id,
    );
    const hasActiveModules = modules.some((module) => module.is_active);

    if (updateModuleCategoryDto.is_active === false && hasActiveModules) {
      throw new BadRequestException(
        `No se puede desactivar la categoría ${moduleCategoryToUpdate.name} porque tiene módulos activos`,
      );
    }

    const oldData = { ...moduleCategoryToUpdate };
    Object.assign(moduleCategoryToUpdate, updateModuleCategoryDto);
    const updatedModuleCategory = await this.moduleCategoriesRepository.save(
      moduleCategoryToUpdate,
    );

    await this.logsService.log(currentUser || null, {
      module: LogModule.MODULE_CATEGORIES,
      action: LogAction.UPDATE,
      description: `Categoría actualizada: ${updatedModuleCategory.name}. UUID: ${updatedModuleCategory.uuid}`,
      oldData,
      newData: updateModuleCategoryDto,
    });

    return new SuccessResponseDto(
      true,
      'Categoría actualizada exitosamente!',
      updatedModuleCategory,
    );
  }

  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<ModuleCategory>> {
    const moduleCategory =
      await this.moduleCategoriesRepository.findByUuid(uuid);

    if (!moduleCategory)
      throw new NotFoundException(
        `La categoría con uuid ${uuid} no se encontró!`,
      );

    const modules = await this.modulesRepository.findByCategoryOrdered(
      moduleCategory.id,
    );
    const hasActiveModules = modules.some((module) => module.is_active);

    if (hasActiveModules) {
      throw new BadRequestException(
        `No se puede eliminar la categoría ${moduleCategory.name} porque tiene módulos activos`,
      );
    }

    await this.moduleCategoriesRepository.softDeleteByUuid(uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.MODULE_CATEGORIES,
      action: LogAction.DELETE,
      description: `Categoría eliminada: ${moduleCategory.name}. UUID: ${moduleCategory.uuid}`,
      oldData: { name: moduleCategory.name, uuid: moduleCategory.uuid },
    });

    return new SuccessResponseDto(
      true,
      'Categoría eliminada exitosamente!',
      moduleCategory,
    );
  }

  async getCategoriesCatalog(): Promise<SuccessResponseDto<ModuleCategory[]>> {
    const categories = await this.moduleCategoriesRepository.findActive();
    return new SuccessResponseDto(
      true,
      'Categorías obtenidas exitosamente!',
      categories,
    );
  }

  async sortCategories(
    orderedUuids: string[],
    currentUser?: User,
  ): Promise<SuccessResponseDto<null>> {
    await this.moduleCategoriesRepository.sortCategories(orderedUuids);

    await this.logsService.log(currentUser || null, {
      module: LogModule.MODULE_CATEGORIES,
      action: LogAction.UPDATE,
      description: `Orden de categorías actualizado`,
      newData: { ordered_uuids: orderedUuids },
    });

    return new SuccessResponseDto(
      true,
      'Categorías ordenadas exitosamente!',
      null,
    );
  }
}
