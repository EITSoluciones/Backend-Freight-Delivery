import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { AppConfig } from '../entities/app-config.entity';

@Injectable()
export class AppConfigRepository {
  constructor(
    @InjectRepository(AppConfig)
    private readonly repository: Repository<AppConfig>,
  ) {}

  merge(config: AppConfig, data: DeepPartial<AppConfig>): AppConfig {
    return this.repository.merge(config, data);
  }

  saveMany(configs: AppConfig[]): Promise<AppConfig[]> {
    return this.repository.save(configs);
  }

  findPublicActive(): Promise<AppConfig[]> {
    return this.repository.find({
      where: { is_public: true, is_active: true },
      order: { key: 'ASC' },
    });
  }

  findPublicActiveByUuid(uuid: string): Promise<AppConfig | null> {
    return this.repository.findOne({
      where: { uuid, is_public: true, is_active: true },
    });
  }

  findAllAdmin(): Promise<AppConfig[]> {
    return this.repository.find({ order: { key: 'ASC' } });
  }

  findByUuid(uuid: string): Promise<AppConfig | null> {
    return this.repository.findOne({ where: { uuid } });
  }

  findActiveByKey(key: string): Promise<AppConfig | null> {
    return this.repository.findOne({ where: { key, is_active: true } });
  }

  findByUuids(uuids: string[]): Promise<AppConfig[]> {
    return this.repository.find({
      where: { uuid: In(uuids) },
      order: { key: 'ASC' },
    });
  }

  findPublicActiveByKey(key: string): Promise<AppConfig | null> {
    return this.repository.findOne({
      where: { key, is_public: true, is_active: true },
    });
  }
}
