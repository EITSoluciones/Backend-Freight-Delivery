import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { SystemLog } from './entities/system-log.entity';

@Module({
  controllers: [LogsController],
  providers: [LogsService],
  imports: [
    TypeOrmModule.forFeature([SystemLog]),
    EventEmitterModule.forRoot(),
  ],
  exports: [LogsService],
})
export class LogsModule {}
