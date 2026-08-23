import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsModule } from 'src/logs/logs.module';
import { CentersController } from './centers.controller';
import { CentersService } from './centers.service';
import { Center } from './entities/center.entity';
import { CentersRepository } from './repositories/centers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Center]), LogsModule],
  controllers: [CentersController],
  providers: [CentersService, CentersRepository],
  exports: [CentersService, CentersRepository],
})
export class CentersModule {}
