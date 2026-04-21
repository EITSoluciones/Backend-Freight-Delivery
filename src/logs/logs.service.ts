import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { SystemLog } from './entities/system-log.entity';
import { QueryLogDto } from '../common/dto/query-log.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/dto/success-response.dto';
import { LogData } from './interfaces/log-data.interface';
import { User } from '../users/entities/user.entity';
import { LOG_EVENT, LogEventPayload } from './events/log.event';

@Injectable()
export class LogsService implements OnModuleInit, OnModuleDestroy {
  private readonly DEFAULT_PLATFORM = 'web';
  private pendingLogs: LogEventPayload[] = [];
  private readonly BATCH_SIZE = 10;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(SystemLog)
    private readonly logRepository: Repository<SystemLog>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, 5000);
  }

  onModuleDestroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushLogs();
  }

  log(user: User | null, logData: LogData, request?: any): void {
    const payload: LogEventPayload = {
      user: user ? { uuid: user.uuid, username: user.username, platforms: user.platforms } : null,
      logData,
      request: request ? {
        ip: this.extractIpAddress(request),
        userAgent: request.headers?.['user-agent'] || null,
        platform: request.headers?.['x-platform-code'] || null,
      } : null,
    };

    this.pendingLogs.push(payload);

    if (this.pendingLogs.length >= this.BATCH_SIZE) {
      this.flushLogs();
    }
  }

  logAsync(user: User | null, logData: LogData, request?: any): void {
    this.eventEmitter.emit(LOG_EVENT, {
      user: user ? { uuid: user.uuid, username: user.username, platforms: user.platforms } : null,
      logData,
      request: request ? {
        ip: this.extractIpAddress(request),
        userAgent: request.headers?.['user-agent'] || null,
        platform: request.headers?.['x-platform-code'] || null,
      } : null,
    });
  }

  private async flushLogs(): Promise<void> {
    if (this.pendingLogs.length === 0) return;

    const logsToSave = this.pendingLogs.splice(0, this.BATCH_SIZE);

    try {
      const logEntities = logsToSave.map(payload => this.createLogEntity(payload));
      await this.logRepository.save(logEntities);
    } catch (error) {
      console.error('Error flushing logs:', error);
      this.pendingLogs.unshift(...logsToSave);
    }
  }

  private createLogEntity(payload: LogEventPayload): SystemLog {
    const log = new SystemLog();
    const { user, logData, request } = payload;

    log.userUuid = user?.uuid || null;
    log.userUsername = user?.username || null;
    log.module = logData.module;
    log.action = logData.action;
    log.entityUuid = logData.entityUuid || null;
    log.entityName = logData.entityName || null;
    log.description = logData.description || null;
    log.oldData = logData.oldData || null;
    log.newData = logData.newData || null;

    if (request) {
      log.ipAddress = request.ip || null;
      log.userAgent = request.userAgent || null;
      log.platform = request.platform || this.getUserPlatform(user) || this.DEFAULT_PLATFORM;
    } else {
      log.platform = this.getUserPlatform(user) || this.DEFAULT_PLATFORM;
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
      const addr = request.socket.remoteAddress;
      return addr.includes('::') ? addr : addr;
    }

    if (request.connection?.remoteAddress) {
      return String(request.connection.remoteAddress);
    }

    return 'unknown';
  }

  async findAll(queryLogDto: QueryLogDto): Promise<PaginatedResponse<SystemLog>> {
    const { limit = 10, page = 1, module, action, userUuid, entityUuid, startDate, endDate } = queryLogDto;

    const where: FindOptionsWhere<SystemLog> = {};

    if (module) where.module = module;
    if (action) where.action = action;
    if (userUuid) where.userUuid = userUuid;
    if (entityUuid) where.entityUuid = entityUuid;

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(new Date(endDate));
    }

    const [logs, total] = await this.logRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return PaginatedResponse.create(logs, total, page, limit, 'Logs retrieved successfully!');
  }

  async findByEntityUuid(entityUuid: string) {
    const logs = await this.logRepository.find({
      where: { entityUuid },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Entity logs retrieved successfully!',
      data: logs,
    };
  }

  async findByUserUuid(userUuid: string, paginationDto?: PaginationDto): Promise<PaginatedResponse<SystemLog>> {
    const { limit = 10, page = 1 } = paginationDto || {};

    const [logs, total] = await this.logRepository.findAndCount({
      where: { userUuid },
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return PaginatedResponse.create(logs, total, page, limit, 'User logs retrieved successfully!');
  }

  async findMyLogs(user: User, paginationDto?: PaginationDto) {
    return this.findByUserUuid(user.uuid, paginationDto);
  }
}
