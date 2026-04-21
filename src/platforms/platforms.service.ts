import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { Platform } from './entities/platform.entity';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@Injectable()
export class PlatformsService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async create(
    createPlatformDto: CreatePlatformDto,
  ): Promise<SuccessResponseDto<Platform>> {
    const platform = this.platformRepository.create(createPlatformDto);
    const saved = await this.platformRepository.save(platform);
    return new SuccessResponseDto(
      true,
      'Plataforma creada exitosamente!',
      saved,
    );
  }

  async findAll(): Promise<SuccessResponseDto<Platform[]>> {
    const platforms = await this.platformRepository.find({
      where: { is_active: true },
    });
    return new SuccessResponseDto(
      true,
      'Plataformas obtenidos exitosamente!',
      platforms,
    );
  }

  async findOne(id: number): Promise<SuccessResponseDto<Platform>> {
    const platform = await this.platformRepository.findOne({ where: { id } });
    if (!platform) {
      throw new NotFoundException(`Plataforma con id ${id} no encontrada`);
    }
    return new SuccessResponseDto(true, 'Plataforma encontrado!', platform);
  }

  async update(
    id: number,
    updatePlatformDto: UpdatePlatformDto,
  ): Promise<SuccessResponseDto<Platform>> {
    const platform = await this.platformRepository.findOne({ where: { id } });
    if (!platform) {
      throw new NotFoundException(`Plataforma con id ${id} no encontrada`);
    }
    Object.assign(platform, updatePlatformDto);
    const updated = await this.platformRepository.save(platform);
    return new SuccessResponseDto(
      true,
      'Plataforma actualizada exitosamente!',
      updated,
    );
  }

  async remove(id: number): Promise<SuccessResponseDto<Platform>> {
    const platform = await this.platformRepository.findOne({ where: { id } });
    if (!platform) {
      throw new NotFoundException(`Plataforma con id ${id} no encontrada`);
    }
    await this.platformRepository.softDelete({ id });
    return new SuccessResponseDto(
      true,
      'Plataforma eliminada exitosamente!',
      platform,
    );
  }
}
