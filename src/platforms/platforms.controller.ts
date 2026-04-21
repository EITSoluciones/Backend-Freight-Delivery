import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { Auth } from 'src/auth/decorators';
import { Permissions } from 'src/auth/interfaces';

@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Get()
  @Auth(Permissions.PlatformsView)
  findAll() {
    return this.platformsService.findAll();
  }
}
