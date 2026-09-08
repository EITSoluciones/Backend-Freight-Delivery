import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLog } from './entities/system-log.entity';
import { QueryLogDto } from '../common/dto/query-log.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/dto/success-response.dto';
import { LogData } from './interfaces/log-data.interface';
import { User } from '../users/entities/user.entity';
import { LogsRepository } from './repositories/logs.repository';
import { Module as ModuleEntity } from '../modules/entities/module.entity';

interface LogPayload {
  user: Pick<User, 'id' | 'platforms'> | null;
  logData: LogData;
  request: {
    ip: string;
    userAgent: string | null;
    platform: string | null;
  } | null;
}

@Injectable()
export class LogsService {
  private readonly DEFAULT_PLATFORM = 'web';

  constructor(
    private readonly logsRepository: LogsRepository,
    @InjectRepository(ModuleEntity)
    private readonly modulesRepository: Repository<ModuleEntity>,
  ) { }

  async log(
    user: User | null,
    logData: LogData,
    request?: any,
  ): Promise<void> {
    const payload: LogPayload = {
      user: user
        ? {
          id: user.id,
          platforms: user.platforms,
        }
        : null,
      logData,
      request: request
        ? {
          ip: this.extractIpAddress(request),
          userAgent: request.headers?.['user-agent'] || null,
          platform: request.headers?.['x-platform-code'] || null,
        }
        : null,
    };

    const module = await this.modulesRepository.findOneBy({
      code: logData.module,
    });
    const log = this.createLogEntity(payload, module?.id ?? null);

    await this.logsRepository.saveMany([log]);
  }

  private createLogEntity(
    payload: LogPayload,
    moduleId: number | null,
  ): SystemLog {
    const log = new SystemLog();
    const { user, logData, request } = payload;

    log.userId = user?.id ?? null;
    log.moduleId = moduleId;
    log.action = logData.action;
    log.description = logData.description ?? null;
    log.oldData = logData.oldData ?? null;
    log.newData = logData.newData ?? null;

    if (request) {
      log.ipAddress = request.ip ?? null;
      log.userAgent = request.userAgent ?? null;
      log.platform =
        request.platform ?? this.getUserPlatform(user) ?? this.DEFAULT_PLATFORM;
    } else {
      log.platform = this.getUserPlatform(user) ?? this.DEFAULT_PLATFORM;
    }

    return log;
  }

  private getUserPlatform(user: { platforms?: any[] } | null): string | null {
    if (!user?.platforms?.length) return null;
    return user.platforms[0]?.code || null;
  }

  private extractIpAddress(request: any): string {
    const forwarded = request.headers?.['x-forwarded-for'];
    if (forwarded) {
      if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
      }
      if (Array.isArray(forwarded)) {
        return String(forwarded[0]);
      }
    }

    const realIp = request.headers?.['x-real-ip'];
    if (realIp) {
      return String(realIp);
    }

    if (request.socket?.remoteAddress) {
      return String(request.socket.remoteAddress);
    }

    if (request.connection?.remoteAddress) {
      return String(request.connection.remoteAddress);
    }

    return 'unknown';
  }

  async findAll(
    queryLogDto: QueryLogDto,
  ): Promise<PaginatedResponse<SystemLog>> {
    const { limit = 10, page = 1 } = queryLogDto;

    const [logs, total] = await this.logsRepository.findAll(queryLogDto);

    return PaginatedResponse.create(
      logs,
      total,
      page,
      limit,
      'Logs retrieved successfully!',
    );
  }

  async findByUserId(
    userId: number,
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResponse<SystemLog>> {
    const { limit = 10, page = 1 } = paginationDto || {};

    const [logs, total] = await this.logsRepository.findByUserId(
      userId,
      paginationDto,
    );

    return PaginatedResponse.create(
      logs,
      total,
      page,
      limit,
      'User logs retrieved successfully!',
    );
  }

  async findMyLogs(user: User, paginationDto?: PaginationDto) {
    return this.findByUserId(user.id, paginationDto);
  }
}
