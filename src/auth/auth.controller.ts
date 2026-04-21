import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Req,
  Headers,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
import { RawHeaders, GetUser } from './decorators';
import type { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { Permissions, ValidRoles } from './interfaces';
import { Auth } from './decorators/auth.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { RequestRefreshTokenDto } from './dto/request-refresh-token.dto';

@ApiTags('Autentificación')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Login
  @Post('login')
  @HttpCode(200)
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  //login refreshToken
  @Post('login-refresh-token')
  @HttpCode(200)
  loginTokenRefresh(@Body() RequestRefreshTokenDto: RequestRefreshTokenDto) {
    return this.authService.refreshAccessToken(
      RequestRefreshTokenDto.refresh_token,
    );
  }

  //logout refreshToken
  @Post('revoke-refresh-token')
  @HttpCode(200)
  revokeToken(@Body() RequestRefreshTokenDto: RequestRefreshTokenDto) {
    return this.authService.revokeRefreshToken(
      RequestRefreshTokenDto.refresh_token,
    );
  }

  @Get('private')
  // @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      message: 'success',
      user,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  @Get('test')
  @Auth(Permissions.Test)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
      roles: user.roles,
      permissions: user.roles.flatMap((role) =>
        (role.permissions || []).map((p) => p.code),
      ),
    };
  }
}
