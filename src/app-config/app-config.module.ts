import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigController } from './app-config.controller';
import { AppConfigService } from './app-config.service';
import { AppConfig } from './entities/app-config.entity';
import { LogsModule } from 'src/logs/logs.module';
import { DocumentsModule } from 'src/documents/documents.module';
import { AppConfigRepository } from './repositories/app-config.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AppConfig]), LogsModule, DocumentsModule],
  controllers: [AppConfigController],
  providers: [AppConfigService, AppConfigRepository],
  exports: [AppConfigService, AppConfigRepository],
})
export class AppConfigModule {}
