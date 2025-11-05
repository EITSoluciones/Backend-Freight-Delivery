import { Module } from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { PlatformsController } from './platforms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from './entities/platform.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PlatformsController],
  providers: [PlatformsService],
    imports:[
      TypeOrmModule.forFeature([ Platform ]),
      AuthModule
    ]
})
export class PlatformsModule {}
