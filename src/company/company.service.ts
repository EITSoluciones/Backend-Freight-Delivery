import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import 'multer';
import { Company, CompanyStatus } from './entities/company.entity';
import { CompanyFiscalAddress } from './entities/company-fiscal-address.entity';
import { CompanyDocument } from './entities/company-document.entity';
import { CompanyConfig } from './entities/company-config.entity';
import { DocumentsService } from '../documents/documents.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';
import { CreateFiscalAddressDto } from './dto/create-fiscal-address.dto';
import {
  CreateCompanyConfigDto,
  UpdateCompanyConfigDto,
} from './dto/company-config.dto';
import { UploadCompanyDocumentDto } from './dto/upload-company-document.dto';
import { v4 as uuidv4 } from 'uuid';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  PaginatedResponse,
  SuccessResponseDto,
} from '../common/dto/success-response.dto';
import { CompanyRepository } from './repositories/company.repository';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly documentsService: DocumentsService,
  ) {}

  // ============ COMPANY ============
  async create(dto: CreateCompanyDto): Promise<SuccessResponseDto<Company>> {
    const existing = await this.companyRepository.findCompanyByActivationCode(
      dto.code_activation,
    );

    if (existing) {
      throw new BadRequestException('El código de activación ya existe');
    }

    const company = this.companyRepository.createCompany({
      uuid: uuidv4(),
      ...dto,
      status: CompanyStatus.PENDING_ACTIVATION,
    });

    const saved = await this.companyRepository.saveCompany(company);
    return new SuccessResponseDto(true, 'Empresa creada exitosamente', saved);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Company>> {
    const { limit = 10, page = 1 } = paginationDto;
    const [companies, total] =
      await this.companyRepository.findCompanies(paginationDto);

    return PaginatedResponse.create(
      companies,
      total,
      page,
      limit,
      'Empresas obtenidas exitosamente',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<Company>> {
    const company =
      await this.companyRepository.findCompanyByUuidWithRelations(uuid);

    if (!company) {
      throw new NotFoundException(`Empresa con uuid ${uuid} no encontrada`);
    }

    return new SuccessResponseDto(true, 'Empresa encontrada', company);
  }

  async update(
    uuid: string,
    dto: UpdateCompanyDto,
  ): Promise<SuccessResponseDto<Company>> {
    const company = await this.companyRepository.findCompanyByUuid(uuid);

    if (!company) {
      throw new NotFoundException(`Empresa con uuid ${uuid} no encontrada`);
    }

    Object.assign(company, dto);
    const updated = await this.companyRepository.saveCompany(company);

    return new SuccessResponseDto(
      true,
      'Empresa actualizada exitosamente',
      updated,
    );
  }

  async remove(uuid: string): Promise<SuccessResponseDto<Company>> {
    const company = await this.companyRepository.findCompanyByUuid(uuid);

    if (!company) {
      throw new NotFoundException(`Empresa con uuid ${uuid} no encontrada`);
    }

    await this.companyRepository.softDeleteCompanyByUuid(uuid);

    return new SuccessResponseDto(
      true,
      'Empresa eliminada exitosamente',
      company,
    );
  }

  // ============ FISCAL ADDRESSES ============
  async createFiscalAddress(
    companyUuid: string,
    dto: CreateFiscalAddressDto,
  ): Promise<SuccessResponseDto<CompanyFiscalAddress>> {
    const { company, address } =
      await this.companyRepository.createFiscalAddressInTransaction(
        companyUuid,
        { uuid: uuidv4(), ...dto },
      );

    if (!company || !address) {
      throw new NotFoundException(
        `Empresa con uuid ${companyUuid} no encontrada`,
      );
    }

    return new SuccessResponseDto(
      true,
      'Dirección fiscal creada exitosamente',
      address,
    );
  }

  async updateFiscalAddress(
    addressUuid: string,
    dto: Partial<CreateFiscalAddressDto>,
  ): Promise<SuccessResponseDto<CompanyFiscalAddress>> {
    const updated =
      await this.companyRepository.updateFiscalAddressInTransaction(
        addressUuid,
        dto,
      );

    if (!updated) {
      throw new NotFoundException(
        `Dirección fiscal con uuid ${addressUuid} no encontrada`,
      );
    }

    return new SuccessResponseDto(
      true,
      'Dirección fiscal actualizada',
      updated,
    );
  }

  async deleteFiscalAddress(
    addressUuid: string,
  ): Promise<SuccessResponseDto<CompanyFiscalAddress>> {
    const address =
      await this.companyRepository.findFiscalAddressByUuid(addressUuid);

    if (!address) {
      throw new NotFoundException(
        `Dirección fiscal con uuid ${addressUuid} no encontrada`,
      );
    }

    await this.companyRepository.softDeleteFiscalAddressByUuid(addressUuid);

    return new SuccessResponseDto(true, 'Dirección fiscal eliminada', address);
  }

  async getDefaultFiscalAddress(
    companyUuid: string,
  ): Promise<SuccessResponseDto<CompanyFiscalAddress>> {
    const company = await this.companyRepository.findCompanyByUuid(companyUuid);

    if (!company) {
      throw new NotFoundException(
        `Empresa con uuid ${companyUuid} no encontrada`,
      );
    }

    let address = await this.companyRepository.findDefaultFiscalAddress(
      company.id,
    );

    if (!address) {
      address = await this.companyRepository.findFirstFiscalAddress(company.id);
    }

    if (!address) {
      throw new NotFoundException('No se encontraron direcciones fiscales');
    }

    return new SuccessResponseDto(
      true,
      'Dirección fiscal por defecto',
      address,
    );
  }

  // ============ DOCUMENTS ============
  async uploadDocument(
    companyUuid: string,
    file: Express.Multer.File,
    dto: UploadCompanyDocumentDto,
  ): Promise<SuccessResponseDto<CompanyDocument>> {
    const company = await this.companyRepository.findCompanyByUuid(companyUuid);

    if (!company) {
      throw new NotFoundException(
        `Empresa con uuid ${companyUuid} no encontrada`,
      );
    }

    const uploadResult = await this.documentsService.uploadFile({
      file,
      folder: `companies/${companyUuid}`,
      documentType: dto.document_type,
      description: dto.description,
    });

    if (dto.is_default) {
      await this.companyRepository.clearDefaultCompanyDocuments(company.id);
    }

    const companyDocument = this.companyRepository.createCompanyDocument({
      uuid: uuidv4(),
      company_id: company.id,
      document_id: uploadResult.document.id,
      is_default: dto.is_default || false,
      description: dto.description,
    });

    const saved =
      await this.companyRepository.saveCompanyDocument(companyDocument);

    return new SuccessResponseDto(true, 'Documento subido exitosamente', saved);
  }

  async deleteDocument(
    documentUuid: string,
  ): Promise<SuccessResponseDto<CompanyDocument>> {
    const companyDocument =
      await this.companyRepository.findCompanyDocumentByUuid(documentUuid);

    if (!companyDocument) {
      throw new NotFoundException(
        `Documento con uuid ${documentUuid} no encontrado`,
      );
    }

    await this.documentsService.deleteByUuid(companyDocument.document.uuid);
    await this.companyRepository.softDeleteCompanyDocumentByUuid(documentUuid);

    return new SuccessResponseDto(true, 'Documento eliminado', companyDocument);
  }

  async getDocuments(
    companyUuid: string,
  ): Promise<SuccessResponseDto<CompanyDocument[]>> {
    const company = await this.companyRepository.findCompanyByUuid(companyUuid);

    if (!company) {
      throw new NotFoundException(
        `Empresa con uuid ${companyUuid} no encontrada`,
      );
    }

    const documents = await this.companyRepository.findCompanyDocuments(
      company.id,
    );

    return new SuccessResponseDto(true, 'Documentos obtenidos', documents);
  }

  // ============ CONFIGS ============
  async createConfig(
    companyUuid: string,
    dto: CreateCompanyConfigDto,
  ): Promise<SuccessResponseDto<CompanyConfig>> {
    const company = await this.companyRepository.findCompanyByUuid(companyUuid);

    if (!company) {
      throw new NotFoundException(
        `Empresa con uuid ${companyUuid} no encontrada`,
      );
    }

    const existingConfig = await this.companyRepository.findCompanyConfigByKey(
      company.id,
      dto.key,
    );

    if (existingConfig) {
      throw new BadRequestException(
        `La configuración con key '${dto.key}' ya existe`,
      );
    }

    const config = this.companyRepository.createCompanyConfig({
      uuid: uuidv4(),
      ...dto,
      company_id: company.id,
    });

    const saved = await this.companyRepository.saveCompanyConfig(config);
    return new SuccessResponseDto(true, 'Configuración creada', saved);
  }

  async updateConfig(
    configUuid: string,
    dto: UpdateCompanyConfigDto,
  ): Promise<SuccessResponseDto<CompanyConfig>> {
    const config =
      await this.companyRepository.findCompanyConfigByUuid(configUuid);

    if (!config) {
      throw new NotFoundException(
        `Configuración con uuid ${configUuid} no encontrada`,
      );
    }

    Object.assign(config, dto);
    const updated = await this.companyRepository.saveCompanyConfig(config);

    return new SuccessResponseDto(true, 'Configuración actualizada', updated);
  }

  async getConfigs(
    companyUuid: string,
  ): Promise<SuccessResponseDto<CompanyConfig[]>> {
    const company = await this.companyRepository.findCompanyByUuid(companyUuid);

    if (!company) {
      throw new NotFoundException(
        `Empresa con uuid ${companyUuid} no encontrada`,
      );
    }

    const configs = await this.companyRepository.findActiveCompanyConfigs(
      company.id,
    );

    return new SuccessResponseDto(true, 'Configuraciones obtenidas', configs);
  }

  async getConfigValue(
    companyUuid: string,
    key: string,
  ): Promise<string | null> {
    const config = await this.companyRepository.findActiveCompanyConfigValue(
      companyUuid,
      key,
    );

    return config?.value || null;
  }

  async deleteConfig(
    configUuid: string,
  ): Promise<SuccessResponseDto<CompanyConfig>> {
    const config =
      await this.companyRepository.findCompanyConfigByUuid(configUuid);

    if (!config) {
      throw new NotFoundException(
        `Configuración con uuid ${configUuid} no encontrada`,
      );
    }

    await this.companyRepository.softDeleteCompanyConfigByUuid(configUuid);

    return new SuccessResponseDto(true, 'Configuración eliminada', config);
  }
}
