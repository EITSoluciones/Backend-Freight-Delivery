import { Controller, Get, Query, Param } from '@nestjs/common';
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

  @Get('test')
  testFindAll() {
    return this.logsService.findAll({ limit: 10, page: 1 });
  }

  @Get('check-user')
  @Auth()
  checkUser(@GetUser() user: User) {
    const permissions = user?.roles?.flatMap((role) =>
      (role.permissions ?? []).map((p: any) => p.code),
    );
    return { user, permissions };
  }

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

  @Get('entity/:entityUuid')
  @Auth(Permissions.LogsView)
  findByEntity(@Param('entityUuid') entityUuid: string) {
    return this.logsService.findByEntityUuid(entityUuid);
  }

  @Get('user/:userUuid')
  @Auth(Permissions.LogsView)
  findByUser(
    @Param('userUuid') userUuid: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.logsService.findByUserUuid(userUuid, paginationDto);
  }
}
