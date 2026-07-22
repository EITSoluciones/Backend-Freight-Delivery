import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Platform } from '../entities/platform.entity';

@Injectable()
export class PlatformsRepository {
  constructor(
    @InjectRepository(Platform)
    private readonly repository: Repository<Platform>,
  ) {}

  create(platform: DeepPartial<Platform>): Platform {
    return this.repository.create(platform);
  }

  save(platform: Platform): Promise<Platform> {
    return this.repository.save(platform);
  }

  findActive(): Promise<Platform[]> {
    return this.repository.find({ where: { is_active: true } });
  }

  findById(id: number): Promise<Platform | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByCodes(codes: string[]): Promise<Platform[]> {
    return this.repository.find({ where: { code: In(codes) } });
  }

  softDeleteById(id: number) {
    return this.repository.softDelete({ id });
  }
}
