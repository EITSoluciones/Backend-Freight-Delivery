import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { Auth } from 'src/auth/decorators';

@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) { }

  @Get()
  @Auth()
  findAll() {
    return this.platformsService.findAll();
  }

}
