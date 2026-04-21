import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemLog } from '../entities/system-log.entity';
import { LOG_EVENT, LogEventPayload } from './log.event';

@Injectable()
export class LogEventListener implements OnModuleInit {
  private readonly DEFAULT_PLATFORM = 'web';
  private pendingLogs: SystemLog[] = [];
  private readonly BATCH_SIZE = 10;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.eventEmitter.on(LOG_EVENT, (payload: LogEventPayload) => {
      const log = this.createLogEntity(payload);
      this.pendingLogs.push(log);

      if (this.pendingLogs.length >= this.BATCH_SIZE) {
        this.flushLogs();
      }
    });

    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, 5000);
  }

  private async flushLogs(): Promise<void> {
    if (this.pendingLogs.length === 0) return;

    const logsToSave = this.pendingLogs.splice(0, this.BATCH_SIZE);

    try {
      await this.eventEmitter.emit('log:save-batch', logsToSave);
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
}
