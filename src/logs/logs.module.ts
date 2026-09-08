import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { SystemLog } from './entities/system-log.entity';
import { LogsRepository } from './repositories/logs.repository';
import { Module as ModuleEntity } from '../modules/entities/module.entity';

@Module({
  controllers: [LogsController],
  providers: [LogsService, LogsRepository],
  imports: [
    TypeOrmModule.forFeature([SystemLog, ModuleEntity]),
  ],
  exports: [LogsService],
})
export class LogsModule {}
