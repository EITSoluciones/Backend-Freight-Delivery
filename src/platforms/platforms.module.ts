import { Module } from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { PlatformsController } from './platforms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from './entities/platform.entity';

@Module({
  controllers: [PlatformsController],
  providers: [PlatformsService],
    imports:[
      TypeOrmModule.forFeature([ Platform ])
    ]
})
export class PlatformsModule {}
