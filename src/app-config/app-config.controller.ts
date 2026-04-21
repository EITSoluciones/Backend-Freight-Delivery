import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { AppConfigService } from './app-config.service';
import {
  SaveAppConfigFormDataDto,
  ValidateActivationCodeDto,
} from './dto';

import { Auth, GetUser } from '../auth/decorators';
import { Permissions } from '../auth/interfaces';
import { User } from 'src/users/entities/user.entity';
import { MAX_IMAGE_SIZE } from 'src/documents/enums/document-extensions.const';

@ApiTags('App Config')
@Controller({
  path: 'app-config',
  version: '1',
})
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Get('public')
  @ApiOperation({ summary: 'Obtener configuraciones públicas activas' })
  findAllPublic() {
    return this.appConfigService.findAllPublic();
  }

  @Get('public/:uuid')
  @ApiOperation({ summary: 'Obtener una configuración pública activa por uuid' })
  findOnePublic(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.appConfigService.findOnePublic(uuid);
  }

  @Post('validate-activation')
  @ApiOperation({ summary: 'Validar código de activación' })
  validateActivation(@Body() validateActivationCodeDto: ValidateActivationCodeDto) {
    return this.appConfigService.validateActivationCode(
      validateActivationCodeDto.code,
    );
  }

  @Get()
  @Auth(Permissions.AppConfigView)
  @ApiOperation({ summary: 'Obtener todas las configuraciones' })
  findAll() {
    return this.appConfigService.findAllAdmin();
  }

  @Get(':uuid')
  @Auth(Permissions.AppConfigView)
  @ApiOperation({ summary: 'Obtener una configuración por uuid' })
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.appConfigService.findOneAdmin(uuid);
  }

  @Put()
  @Auth(Permissions.AppConfigUpdate)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'favicon', maxCount: 1 },
      ],
      {
        limits: {
          files: 2,
          fileSize: MAX_IMAGE_SIZE,
        },
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SaveAppConfigFormDataDto })
  @ApiOperation({
    summary:
      'Guardar configuraciones del formulario en una sola petición; logo/favicon se resuelven según el valor y el archivo recibido',
  })
  saveForm(
    @Body() body: SaveAppConfigFormDataDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      favicon?: Express.Multer.File[];
    },
    @GetUser() currentUser: User,
  ) {
    if (!body?.configs) {
      throw new BadRequestException('Debes enviar el campo configs');
    }

    return this.appConfigService.saveFormData(body, files, currentUser);
  }

  @Get('public/file/:type')
  async getPublicConfigFile(
    @Param('type') type: string,
    @Res() res: Response,
  ) {
    const fileData = await this.appConfigService.getPublicConfigFile(type);

  const absolutePath = path.resolve(process.cwd(), fileData.absolutePath);

  res.setHeader('Content-Type', fileData.document.mime_type);
  return res.sendFile(absolutePath);

  }
}