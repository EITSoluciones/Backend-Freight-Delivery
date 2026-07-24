import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { SystemLog } from './entities/system-log.entity';
import { LogsRepository } from './repositories/logs.repository';

@Module({
  controllers: [LogsController],
  providers: [LogsService, LogsRepository],
  imports: [
    TypeOrmModule.forFeature([SystemLog]),
    EventEmitterModule.forRoot(),
  ],
  exports: [LogsService],
})
export class LogsModule {}
