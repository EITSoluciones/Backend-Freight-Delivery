import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { QueryLogDto } from '../common/dto/query-log.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth, GetUser } from '../auth/decorators';
import { Permissions } from '../auth/interfaces';
import { User } from '../users/entities/user.entity';

@ApiTags('Logs')
@Controller({
  path: 'logs',
  version: '1',
})
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @Auth(Permissions.LogsView)
  findAll(@Query() queryLogDto: QueryLogDto) {
    return this.logsService.findAll(queryLogDto);
  }

  @Get('my-logs')
  @Auth()
  findMyLogs(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.logsService.findMyLogs(user, paginationDto);
  }

  @Get('user/:userId')
  @Auth(Permissions.LogsView)
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.logsService.findByUserId(userId, paginationDto);
  }
}
