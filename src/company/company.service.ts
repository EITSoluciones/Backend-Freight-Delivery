import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyFiscalAddress)
    private readonly fiscalAddressRepository: Repository<CompanyFiscalAddress>,
    @InjectRepository(CompanyDocument)
    private readonly companyDocumentRepository: Repository<CompanyDocument>,
    @InjectRepository(CompanyConfig)
    private readonly companyConfigRepository: Repository<CompanyConfig>,
    private readonly documentsService: DocumentsService,
    private readonly dataSource: DataSource,
  ) {}

  // ============ COMPANY ============
  async create(dto: CreateCompanyDto): Promise<SuccessResponseDto<Company>> {
    const existing = await this.companyRepository.findOne({
      where: { code_activation: dto.code_activation },
    });

    if (existing) {
      throw new BadRequestException('El código de activación ya existe');
    }

    const company = this.companyRepository.create({
      uuid: uuidv4(),
      ...dto,
      status: CompanyStatus.PENDING_ACTIVATION,
    });

    const saved = await this.companyRepository.save(company);
    return new SuccessResponseDto(true, 'Empresa creada exitosamente', saved);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Company>> {
    const { limit = 10, page = 1 } = paginationDto;
    const [companies, total] = await this.companyRepository.findAndCount({
      relations: ['fiscal_addresses', 'documents', 'documents.document'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });

    return PaginatedResponse.create(
      companies,
      total,
      page,
      limit,
      'Empresas obtenidas exitosamente',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<Company>> {
    const company = await this.companyRepository.findOne({
      where: { uuid },
      relations: ['fiscal_addresses', 'documents', 'documents.document'],
    });

    if (!company) {
      throw new NotFoundException(`Empresa con uuid ${uuid} no encontrada`);
    }

    return new SuccessResponseDto(true, 'Empresa encontrada', company);
  }

  async update(
    uuid: string,
    dto: UpdateCompanyDto,
  ): Promise<SuccessResponseDto<Company>> {
    const company = await this.companyRepository.findOne({ where: { uuid } });

    if (!company) {
      throw new NotFoundException(`Empresa con uuid ${uuid} no encontrada`);
    }

    Object.assign(company, dto);
    const updated = await this.companyRepository.save(company);

    return new SuccessResponseDto(
      true,
      'Empresa actualizada exitosamente',
      updated,
    );
  }

  async remove(uuid: string): Promise<SuccessResponseDto<Company>> {
    const company = await this.companyRepository.findOne({ where: { uuid } });

    if (!company) {
      throw new NotFoundException(`Empresa con uuid ${uuid} no encontrada`);
    }

    await this.companyRepository.softDelete({ uuid });

    return new SuccessResponseDto(
      true,
      'Empresa eliminada exitosamente',
      company,
    );
  }

  async validateActivation(
    code: string,
  ): Promise<SuccessResponseDto<{ valid: boolean; company: Company | null }>> {
    const company = await this.companyRepository.findOne({
      where: { code_activation: code },
    });

    if (!company) {
      return new SuccessResponseDto(true, 'Código inválido', {
        valid: false,
        company: null,
      });
    }

    const isValid = company.status === CompanyStatus.ACTIVE;
    return new SuccessResponseDto(
      true,
      isValid ? 'Código válido' : 'Empresa pendiente de activación',
      { valid: isValid, company },
    );
  }

  async activateCompany(uuid: string): Promise<SuccessResponseDto<Company>> {
    const company = await this.companyRepository.findOne({ where: { uuid } });

    if (!company) {
      throw new NotFoundException(`Empresa con uuid ${uuid} no encontrada`);
    }

    company.status = CompanyStatus.ACTIVE;
    const updated = await this.companyRepository.save(company);

    return new SuccessResponseDto(
      true,
      'Empresa activada exitosamente',
      updated,
    );
  }

  // ============ FISCAL ADDRESSES ============
  async createFiscalAddress(
    companyUuid: string,
    dto: CreateFiscalAddressDto,
  ): Promise<SuccessResponseDto<CompanyFiscalAddress>> {
    return this.dataSource.transaction(async (manager) => {
      const company = await manager.findOne(Company, {
        where: { uuid: companyUuid },
      });

      if (!company) {
        throw new NotFoundException(
          `Empresa con uuid ${companyUuid} no encontrada`,
        );
      }

      if (dto.is_default) {
        await manager.update(
          CompanyFiscalAddress,
          { company_id: company.id },
          { is_default: false },
        );
      }

      const address = manager.create(CompanyFiscalAddress, {
        uuid: uuidv4(),
        ...dto,
        company_id: company.id,
      });

      const saved = await manager.save(address);
      return new SuccessResponseDto(
        true,
        'Dirección fiscal creada exitosamente',
        saved,
      );
    });
  }

  async updateFiscalAddress(
    addressUuid: string,
    dto: Partial<CreateFiscalAddressDto>,
  ): Promise<SuccessResponseDto<CompanyFiscalAddress>> {
    return this.dataSource.transaction(async (manager) => {
      const address = await manager.findOne(CompanyFiscalAddress, {
        where: { uuid: addressUuid },
      });

      if (!address) {
        throw new NotFoundException(
          `Dirección fiscal con uuid ${addressUuid} no encontrada`,
        );
      }

      if (dto.is_default) {
        await manager.update(
          CompanyFiscalAddress,
          { company_id: address.company_id },
          { is_default: false },
        );
      }

      Object.assign(address, dto);
      const updated = await manager.save(address);

      return new SuccessResponseDto(
        true,
        'Dirección fiscal actualizada',
        updated,
      );
    });
  }

  async deleteFiscalAddress(
    addressUuid: string,
  ): Promise<SuccessResponseDto<CompanyFiscalAddress>> {
    const address = await this.fiscalAddressRepository.findOne({
      where: { uuid: addressUuid },
    });

    if (!address) {
      throw new NotFoundException(
        `Dirección fiscal con uuid ${addressUuid} no encontrada`,
      );
    }

    await this.fiscalAddressRepository.softDelete({ uuid: addressUuid });

    return new SuccessResponseDto(true, 'Dirección fiscal eliminada', address);
  }

  async getDefaultFiscalAddress(
    companyUuid: string,
  ): Promise<SuccessResponseDto<CompanyFiscalAddress>> {
    const company = await this.companyRepository.findOne({
      where: { uuid: companyUuid },
    });

    if (!company) {
      throw new NotFoundException(
        `Empresa con uuid ${companyUuid} no encontrada`,
      );
    }

    let address = await this.fiscalAddressRepository.findOne({
      where: { company_id: company.id, is_default: true },
    });

    if (!address) {
      address = await this.fiscalAddressRepository.findOne({
        where: { company_id: company.id },
        order: { created_at: 'ASC' },
      });
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
    const company = await this.companyRepository.findOne({
      where: { uuid: companyUuid },
    });

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
      await this.companyDocumentRepository.update(
        { company_id: company.id },
        { is_default: false },
      );
    }

    const companyDocument = this.companyDocumentRepository.create({
      uuid: uuidv4(),
      company_id: company.id,
      document_id: uploadResult.document.id,
      is_default: dto.is_default || false,
      description: dto.description,
    });

    const saved = await this.companyDocumentRepository.save(companyDocument);

    return new SuccessResponseDto(true, 'Documento subido exitosamente', saved);
  }

  async deleteDocument(
    documentUuid: string,
  ): Promise<SuccessResponseDto<CompanyDocument>> {
    const companyDocument = await this.companyDocumentRepository.findOne({
      where: { uuid: documentUuid },
      relations: ['document'],
    });

    if (!companyDocument) {
      throw new NotFoundException(
        `Documento con uuid ${documentUuid} no encontrado`,
      );
    }

    await this.documentsService.delete(companyDocument.document.uuid);
    await this.companyDocumentRepository.softDelete({ uuid: documentUuid });

    return new SuccessResponseDto(true, 'Documento eliminado', companyDocument);
  }

  async getDocuments(
    companyUuid: string,
  ): Promise<SuccessResponseDto<CompanyDocument[]>> {
    const company = await this.companyRepository.findOne({
      where: { uuid: companyUuid },
    });

    if (!company) {
      throw new NotFoundException(
        `Empresa con uuid ${companyUuid} no encontrada`,
      );
    }

    const documents = await this.companyDocumentRepository.find({
      where: { company_id: company.id },
      relations: ['document'],
      order: { created_at: 'DESC' },
    });

    return new SuccessResponseDto(true, 'Documentos obtenidos', documents);
  }

  // ============ CONFIGS ============
  async createConfig(
    companyUuid: string,
    dto: CreateCompanyConfigDto,
  ): Promise<SuccessResponseDto<CompanyConfig>> {
    const company = await this.companyRepository.findOne({
      where: { uuid: companyUuid },
    });

    if (!company) {
      throw new NotFoundException(
        `Empresa con uuid ${companyUuid} no encontrada`,
      );
    }

    const existingConfig = await this.companyConfigRepository.findOne({
      where: { company_id: company.id, key: dto.key },
    });

    if (existingConfig) {
      throw new BadRequestException(
        `La configuración con key '${dto.key}' ya existe`,
      );
    }

    const config = this.companyConfigRepository.create({
      uuid: uuidv4(),
      ...dto,
      company_id: company.id,
    });

    const saved = await this.companyConfigRepository.save(config);
    return new SuccessResponseDto(true, 'Configuración creada', saved);
  }

  async updateConfig(
    configUuid: string,
    dto: UpdateCompanyConfigDto,
  ): Promise<SuccessResponseDto<CompanyConfig>> {
    const config = await this.companyConfigRepository.findOne({
      where: { uuid: configUuid },
    });

    if (!config) {
      throw new NotFoundException(
        `Configuración con uuid ${configUuid} no encontrada`,
      );
    }

    Object.assign(config, dto);
    const updated = await this.companyConfigRepository.save(config);

    return new SuccessResponseDto(true, 'Configuración actualizada', updated);
  }

  async getConfigs(
    companyUuid: string,
  ): Promise<SuccessResponseDto<CompanyConfig[]>> {
    const company = await this.companyRepository.findOne({
      where: { uuid: companyUuid },
    });

    if (!company) {
      throw new NotFoundException(
        `Empresa con uuid ${companyUuid} no encontrada`,
      );
    }

    const configs = await this.companyConfigRepository.find({
      where: { company_id: company.id, is_active: true },
      order: { key: 'ASC' },
    });

    return new SuccessResponseDto(true, 'Configuraciones obtenidas', configs);
  }

  async getConfigValue(
    companyUuid: string,
    key: string,
  ): Promise<string | null> {
    const config = await this.companyConfigRepository.findOne({
      where: { company: { uuid: companyUuid }, key, is_active: true },
    });

    return config?.value || null;
  }

  async deleteConfig(
    configUuid: string,
  ): Promise<SuccessResponseDto<CompanyConfig>> {
    const config = await this.companyConfigRepository.findOne({
      where: { uuid: configUuid },
    });

    if (!config) {
      throw new NotFoundException(
        `Configuración con uuid ${configUuid} no encontrada`,
      );
    }

    await this.companyConfigRepository.softDelete({ uuid: configUuid });

    return new SuccessResponseDto(true, 'Configuración eliminada', config);
  }
}
