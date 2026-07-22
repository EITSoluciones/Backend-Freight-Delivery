import { Module } from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { PlatformsController } from './platforms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from './entities/platform.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PlatformsRepository } from './repositories/platforms.repository';

@Module({
  controllers: [PlatformsController],
  providers: [PlatformsService, PlatformsRepository],
  imports: [TypeOrmModule.forFeature([Platform]), AuthModule],
  exports: [PlatformsRepository],
})
export class PlatformsModule {}
