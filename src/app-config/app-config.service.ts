import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { AppConfig } from './entities/app-config.entity';
import {
  SaveAppConfigFormDataDto,
  UpdateAppConfigDto,
} from './dto';

import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { User } from 'src/users/entities/user.entity';
import { LogsService } from 'src/logs/logs.service';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { DocumentsService } from 'src/documents/documents.service';
import { DocumentType } from 'src/documents/enums/document-type.enum';
import { Document } from 'src/documents/entities/document.entity';
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
} from 'src/documents/enums/document-extensions.const';

type AppConfigUploadType = 'logo' | 'favicon';

type AppConfigFormFiles = {
  logo?: Express.Multer.File[];
  favicon?: Express.Multer.File[];
};

type UploadedConfigDocument = {
  type: AppConfigUploadType;
  document: Document;
};

@Injectable()
export class AppConfigService {
  private readonly ACTIVATION_CODE_KEY = 'activation_code';
  private readonly APP_CONFIG_FOLDER = 'app_config';
  private readonly FILE_KEYS: AppConfigUploadType[] = ['logo', 'favicon'];

  constructor(
    @InjectRepository(AppConfig)
    private readonly appConfigRepository: Repository<AppConfig>,
    private readonly logsService: LogsService,
    private readonly documentsService: DocumentsService,
  ) {}

  async findAllPublic(): Promise<SuccessResponseDto<AppConfig[]>> {
    const configs = await this.appConfigRepository.find({
      where: {
        is_public: true,
        is_active: true,
      },
      order: { key: 'ASC' },
    });

    return new SuccessResponseDto(
      true,
      'Configuraciones públicas obtenidas exitosamente',
      configs,
    );
  }

  async findOnePublic(uuid: string): Promise<SuccessResponseDto<AppConfig>> {
    const config = await this.appConfigRepository.findOne({
      where: {
        uuid,
        is_public: true,
        is_active: true,
      },
    });

    if (!config) {
      throw new NotFoundException(
        `Configuración pública activa con uuid "${uuid}" no encontrada`,
      );
    }

    return new SuccessResponseDto(
      true,
      'Configuración pública encontrada',
      config,
    );
  }

  async findAllAdmin(): Promise<SuccessResponseDto<AppConfig[]>> {
    const configs = await this.appConfigRepository.find({
      order: { key: 'ASC' },
    });

    return new SuccessResponseDto(
      true,
      'Configuraciones obtenidas exitosamente',
      configs,
    );
  }

  async findOneAdmin(uuid: string): Promise<SuccessResponseDto<AppConfig>> {
    const config = await this.appConfigRepository.findOne({
      where: { uuid },
    });

    if (!config) {
      throw new NotFoundException(
        `Configuración con uuid "${uuid}" no encontrada`,
      );
    }

    return new SuccessResponseDto(true, 'Configuración encontrada', config);
  }

  async findByKey(key: string): Promise<string | null> {
    const config = await this.appConfigRepository.findOne({
      where: {
        key,
        is_active: true,
      },
    });

    return config?.value ?? null;
  }

  async validateActivationCode(
    code: string,
  ): Promise<SuccessResponseDto<{ valid: boolean }>> {
    const normalizedCode = code?.trim();

    if (!normalizedCode) {
      throw new BadRequestException(
        'Debes enviar un código de activación válido',
      );
    }

    const activationConfig = await this.appConfigRepository.findOne({
      where: {
        key: this.ACTIVATION_CODE_KEY,
        is_active: true,
      },
    });

    const isValid = activationConfig?.value?.trim() === normalizedCode;

    return new SuccessResponseDto(
      true,
      isValid ? 'Código válido' : 'Código inválido',
      { valid: isValid },
    );
  }

  async saveFormData(
    body: SaveAppConfigFormDataDto,
    files: AppConfigFormFiles,
    currentUser?: User,
  ): Promise<SuccessResponseDto<AppConfig[]>> {
    const configs = await this.parseConfigsPayload(body.configs);

    if (!configs.length) {
      throw new BadRequestException('Debes enviar al menos una configuración');
    }

    const logoFile = files?.logo?.[0];
    const faviconFile = files?.favicon?.[0];

    this.validateOptionalImageFile('logo', logoFile);
    this.validateOptionalImageFile('favicon', faviconFile);

    const uuids = configs.map((config) => config.uuid);
    const uniqueUuids = new Set(uuids);

    if (uniqueUuids.size !== uuids.length) {
      throw new BadRequestException(
        'No se permiten uuids duplicados en la actualización',
      );
    }

    const existingConfigs = await this.appConfigRepository.find({
      where: {
        uuid: In([...uniqueUuids]),
      },
      order: { key: 'ASC' },
    });

    const existingByUuid = new Map<string, AppConfig>(
      existingConfigs.map((config) => [config.uuid, config]),
    );

    const missingUuids = [...uniqueUuids].filter(
      (uuid) => !existingByUuid.has(uuid),
    );

    if (missingUuids.length) {
      throw new NotFoundException(
        `Configuraciones con uuid "${missingUuids.join('", "')}" no encontradas`,
      );
    }

    const requestedFileConfigKeys = new Set(
      existingConfigs
        .map((config) => this.asFileConfigType(config.key))
        .filter((value): value is AppConfigUploadType => value !== null),
    );

    if (logoFile && !requestedFileConfigKeys.has('logo')) {
      throw new BadRequestException(
        'Si envías el archivo logo, también debes enviar en configs[] la configuración logo',
      );
    }

    if (faviconFile && !requestedFileConfigKeys.has('favicon')) {
      throw new BadRequestException(
        'Si envías el archivo favicon, también debes enviar en configs[] la configuración favicon',
      );
    }

    const uploadedDocuments: UploadedConfigDocument[] = [];
    const oldDocumentUuidsToDelete = new Set<string>();

    try {
      const configsToSave: AppConfig[] = [];
      const oldDataByUuid = new Map<string, Record<string, unknown>>();
      const uploadedDocumentByType = new Map<AppConfigUploadType, Document>();

      for (const dto of configs) {
        const existing = existingByUuid.get(dto.uuid)!;
        oldDataByUuid.set(existing.uuid, this.toLoggableConfig(existing));

        const fileType = this.asFileConfigType(existing.key);
        let merged = this.mergeNonValueChanges(existing, dto);

        if (!fileType) {
          merged = this.appConfigRepository.merge(merged, {
            value: dto.value,
          });
          configsToSave.push(merged);
          continue;
        }

        const file = fileType === 'logo' ? logoFile : faviconFile;

        if (file) {
          const uploadResult = await this.documentsService.uploadFile({
            file,
            folder: this.APP_CONFIG_FOLDER,
            documentType: this.mapUploadTypeToDocumentType(fileType),
            description: `Archivo ${fileType} de configuración`,
          });

          uploadedDocuments.push({
            type: fileType,
            document: uploadResult.document,
          });
          uploadedDocumentByType.set(fileType, uploadResult.document);

          if (existing.value?.trim()) {
            oldDocumentUuidsToDelete.add(existing.value.trim());
          }

          merged.value = uploadResult.document.uuid;
          configsToSave.push(merged);
          continue;
        }

        if (this.shouldDeleteFileByValue(dto.value)) {
          if (existing.value?.trim()) {
            oldDocumentUuidsToDelete.add(existing.value.trim());
          }

          merged.value = null;
          configsToSave.push(merged);
          continue;
        }

        merged.value = existing.value;
        configsToSave.push(merged);
      }

      const savedConfigs = await this.appConfigRepository.manager.transaction(
        async (manager) => {
          const repository = manager.getRepository(AppConfig);
          const persistedConfigs = await repository.save(configsToSave);

          for (const savedConfig of persistedConfigs) {
            const fileType = this.asFileConfigType(savedConfig.key);
            const uploadedDocument = fileType
              ? uploadedDocumentByType.get(fileType)
              : undefined;

            await this.logsService.log(currentUser || null, {
              module: LogModule.APP_CONFIG,
              action: LogAction.UPDATE,
              entityUuid: savedConfig.uuid,
              entityName: savedConfig.key,
              description: `Configuración actualizada: ${savedConfig.key}`,
              oldData: oldDataByUuid.get(savedConfig.uuid),
              newData: {
                ...this.toLoggableConfig(savedConfig),
                documentUuid: uploadedDocument?.uuid,
                filePath: uploadedDocument?.file_path,
              },
            });
          }

          return persistedConfigs;
        },
      );

      await this.deleteDocumentsSafely([...oldDocumentUuidsToDelete]);

      return new SuccessResponseDto(
        true,
        'Configuraciones actualizadas exitosamente',
        savedConfigs,
      );
    } catch (error) {
      await this.deleteDocumentsSafely(
        uploadedDocuments.map((item) => item.document.uuid),
      );
      throw error;
    }
  }

  async getPublicConfigFile(
    type: string,
  ): Promise<{ document: Document; absolutePath: string }> {
    const normalizedType = this.normalizeUploadType(type);

    const config = await this.appConfigRepository.findOne({
      where: {
        key: normalizedType,
        is_public: true,
        is_active: true,
      },
    });

    if (!config?.value?.trim()) {
      throw new NotFoundException(
        `La configuración pública ${normalizedType} no tiene archivo asignado`,
      );
    }

    const document = await this.documentsService.findByUuid(config.value.trim());
    const exists = await this.documentsService.fileExists(document);

    if (!exists) {
      throw new NotFoundException(
        `El archivo asociado a "${normalizedType}" no existe físicamente`,
      );
    }

    const absolutePath = await this.documentsService.getAbsolutePath(document);

    return {
      document,
      absolutePath,
    };
  }

  private async parseConfigsPayload(payload: string): Promise<UpdateAppConfigDto[]> {
    let parsedPayload: unknown;

    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      throw new BadRequestException('El campo configs debe ser un JSON válido');
    }

    if (!Array.isArray(parsedPayload)) {
      throw new BadRequestException('El campo configs debe ser un arreglo');
    }

    const dtos = plainToInstance(UpdateAppConfigDto, parsedPayload);

    for (const dto of dtos) {
      const errors = await validate(dto);

      if (errors.length) {
        throw new BadRequestException(errors);
      }
    }

    return dtos;
  }

  private mergeNonValueChanges(
    existing: AppConfig,
    dto: UpdateAppConfigDto,
  ): AppConfig {
    return this.appConfigRepository.merge(existing, {
      type: dto.type,
      description: dto.description,
      is_public: dto.is_public,
      is_active: dto.is_active,
    });
  }

  private shouldDeleteFileByValue(value?: string | null): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string') {
      return value.trim().length === 0;
    }

    return false;
  }

  private asFileConfigType(key: string): AppConfigUploadType | null {
    return this.FILE_KEYS.includes(key as AppConfigUploadType)
      ? (key as AppConfigUploadType)
      : null;
  }

  private normalizeUploadType(type: string): AppConfigUploadType {
    const normalizedType = type?.trim()?.toLowerCase() as AppConfigUploadType;

    if (!this.FILE_KEYS.includes(normalizedType)) {
      throw new BadRequestException(
        `Tipo de archivo inválido. Valores permitidos: ${this.FILE_KEYS.join(', ')}`,
      );
    }

    return normalizedType;
  }

  private validateOptionalImageFile(
    type: AppConfigUploadType,
    file?: Express.Multer.File,
  ): void {
    if (!file) {
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `El archivo ${type} excede el tamaño máximo permitido de 1MB`,
      );
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo MIME no permitido para ${type}`,
      );
    }

    const originalName = file.originalname.toLowerCase();
    const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
      originalName.endsWith(ext),
    );

    if (!hasValidExtension) {
      throw new BadRequestException(
        `Extensión de archivo no permitida para ${type}`,
      );
    }
  }

  private mapUploadTypeToDocumentType(type: AppConfigUploadType): DocumentType {
    switch (type) {
      case 'logo':
        return DocumentType.LOGO;
      case 'favicon':
        return DocumentType.FAVICON;
      default:
        throw new BadRequestException(`Tipo de documento no soportado: ${type}`);
    }
  }

  private toLoggableConfig(config: AppConfig): Record<string, unknown> {
    return {
      uuid: config.uuid,
      key: config.key,
      value: config.value,
      type: config.type,
      description: config.description,
      is_public: config.is_public,
      is_active: config.is_active,
    };
  }

  private async deleteDocumentsSafely(documentUuids: string[]): Promise<void> {
    if (!documentUuids.length) {
      return;
    }

    await Promise.allSettled(
      documentUuids.map((uuid) => this.documentsService.deleteByUuid(uuid)),
    );
  }
}