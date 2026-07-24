import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Auth()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.notificationsService.findAll(paginationDto);
  }

  @Get(':uuid')
  @Auth()
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.notificationsService.findOne(uuid);
  }

  @Patch(':uuid')
  @Auth()
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(uuid, updateNotificationDto);
  }

  @Delete(':uuid')
  @Auth()
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.notificationsService.remove(uuid);
  }
}
