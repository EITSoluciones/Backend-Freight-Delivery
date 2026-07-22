import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { Platform } from './entities/platform.entity';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { PlatformsRepository } from './repositories/platforms.repository';

@Injectable()
export class PlatformsService {
  constructor(private readonly platformsRepository: PlatformsRepository) {}

  async create(
    createPlatformDto: CreatePlatformDto,
  ): Promise<SuccessResponseDto<Platform>> {
    const platform = this.platformsRepository.create(createPlatformDto);
    const saved = await this.platformsRepository.save(platform);
    return new SuccessResponseDto(
      true,
      'Plataforma creada exitosamente!',
      saved,
    );
  }

  async findAll(): Promise<SuccessResponseDto<Platform[]>> {
    const platforms = await this.platformsRepository.findActive();
    return new SuccessResponseDto(
      true,
      'Plataformas obtenidos exitosamente!',
      platforms,
    );
  }

  async findOne(id: number): Promise<SuccessResponseDto<Platform>> {
    const platform = await this.platformsRepository.findById(id);
    if (!platform) {
      throw new NotFoundException(`Plataforma con id ${id} no encontrada`);
    }
    return new SuccessResponseDto(true, 'Plataforma encontrado!', platform);
  }

  async update(
    id: number,
    updatePlatformDto: UpdatePlatformDto,
  ): Promise<SuccessResponseDto<Platform>> {
    const platform = await this.platformsRepository.findById(id);
    if (!platform) {
      throw new NotFoundException(`Plataforma con id ${id} no encontrada`);
    }
    Object.assign(platform, updatePlatformDto);
    const updated = await this.platformsRepository.save(platform);
    return new SuccessResponseDto(
      true,
      'Plataforma actualizada exitosamente!',
      updated,
    );
  }

  async remove(id: number): Promise<SuccessResponseDto<Platform>> {
    const platform = await this.platformsRepository.findById(id);
    if (!platform) {
      throw new NotFoundException(`Plataforma con id ${id} no encontrada`);
    }
    await this.platformsRepository.softDeleteById(id);
    return new SuccessResponseDto(
      true,
      'Plataforma eliminada exitosamente!',
      platform,
    );
  }
}
