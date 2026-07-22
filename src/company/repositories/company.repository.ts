import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CompanyConfig } from '../entities/company-config.entity';
import { CompanyDocument } from '../entities/company-document.entity';
import { CompanyFiscalAddress } from '../entities/company-fiscal-address.entity';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyFiscalAddress)
    private readonly fiscalAddressRepository: Repository<CompanyFiscalAddress>,
    @InjectRepository(CompanyDocument)
    private readonly companyDocumentRepository: Repository<CompanyDocument>,
    @InjectRepository(CompanyConfig)
    private readonly companyConfigRepository: Repository<CompanyConfig>,
    private readonly dataSource: DataSource,
  ) {}

  createCompany(company: DeepPartial<Company>): Company {
    return this.companyRepository.create(company);
  }

  saveCompany(company: Company): Promise<Company> {
    return this.companyRepository.save(company);
  }

  softDeleteCompanyByUuid(uuid: string) {
    return this.companyRepository.softDelete({ uuid });
  }

  findCompanyByActivationCode(
    code_activation: string,
  ): Promise<Company | null> {
    return this.companyRepository.findOne({ where: { code_activation } });
  }

  findCompanies(paginationDto: PaginationDto): Promise<[Company[], number]> {
    const { limit = 10, page = 1 } = paginationDto;

    return this.companyRepository.findAndCount({
      relations: ['fiscal_addresses', 'documents', 'documents.document'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });
  }

  findCompanyByUuid(uuid: string): Promise<Company | null> {
    return this.companyRepository.findOne({ where: { uuid } });
  }

  findCompanyByUuidWithRelations(uuid: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { uuid },
      relations: ['fiscal_addresses', 'documents', 'documents.document'],
    });
  }

  createFiscalAddress(
    address: DeepPartial<CompanyFiscalAddress>,
  ): CompanyFiscalAddress {
    return this.fiscalAddressRepository.create(address);
  }

  saveFiscalAddress(
    address: CompanyFiscalAddress,
  ): Promise<CompanyFiscalAddress> {
    return this.fiscalAddressRepository.save(address);
  }

  softDeleteFiscalAddressByUuid(uuid: string) {
    return this.fiscalAddressRepository.softDelete({ uuid });
  }

  findFiscalAddressByUuid(uuid: string): Promise<CompanyFiscalAddress | null> {
    return this.fiscalAddressRepository.findOne({ where: { uuid } });
  }

  findDefaultFiscalAddress(
    company_id: number,
  ): Promise<CompanyFiscalAddress | null> {
    return this.fiscalAddressRepository.findOne({
      where: { company_id, is_default: true },
    });
  }

  findFirstFiscalAddress(
    company_id: number,
  ): Promise<CompanyFiscalAddress | null> {
    return this.fiscalAddressRepository.findOne({
      where: { company_id },
      order: { created_at: 'ASC' },
    });
  }

  clearDefaultFiscalAddresses(company_id: number) {
    return this.fiscalAddressRepository.update(
      { company_id },
      { is_default: false },
    );
  }

  createFiscalAddressInTransaction(
    companyUuid: string,
    addressData: DeepPartial<CompanyFiscalAddress>,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const company = await manager.findOne(Company, {
        where: { uuid: companyUuid },
      });

      if (!company) {
        return { company: null, address: null };
      }

      if (addressData.is_default) {
        await manager.update(
          CompanyFiscalAddress,
          { company_id: company.id },
          { is_default: false },
        );
      }

      const address = manager.create(CompanyFiscalAddress, {
        ...addressData,
        company_id: company.id,
      });

      return { company, address: await manager.save(address) };
    });
  }

  updateFiscalAddressInTransaction(
    addressUuid: string,
    addressData: DeepPartial<CompanyFiscalAddress>,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const address = await manager.findOne(CompanyFiscalAddress, {
        where: { uuid: addressUuid },
      });

      if (!address) {
        return null;
      }

      if (addressData.is_default) {
        await manager.update(
          CompanyFiscalAddress,
          { company_id: address.company_id },
          { is_default: false },
        );
      }

      Object.assign(address, addressData);
      return manager.save(address);
    });
  }

  createCompanyDocument(
    document: DeepPartial<CompanyDocument>,
  ): CompanyDocument {
    return this.companyDocumentRepository.create(document);
  }

  saveCompanyDocument(document: CompanyDocument): Promise<CompanyDocument> {
    return this.companyDocumentRepository.save(document);
  }

  softDeleteCompanyDocumentByUuid(uuid: string) {
    return this.companyDocumentRepository.softDelete({ uuid });
  }

  findCompanyDocumentByUuid(uuid: string): Promise<CompanyDocument | null> {
    return this.companyDocumentRepository.findOne({
      where: { uuid },
      relations: ['document'],
    });
  }

  findCompanyDocuments(company_id: number): Promise<CompanyDocument[]> {
    return this.companyDocumentRepository.find({
      where: { company_id },
      relations: ['document'],
      order: { created_at: 'DESC' },
    });
  }

  clearDefaultCompanyDocuments(company_id: number) {
    return this.companyDocumentRepository.update(
      { company_id },
      { is_default: false },
    );
  }

  createCompanyConfig(config: DeepPartial<CompanyConfig>): CompanyConfig {
    return this.companyConfigRepository.create(config);
  }

  saveCompanyConfig(config: CompanyConfig): Promise<CompanyConfig> {
    return this.companyConfigRepository.save(config);
  }

  softDeleteCompanyConfigByUuid(uuid: string) {
    return this.companyConfigRepository.softDelete({ uuid });
  }

  findCompanyConfigByUuid(uuid: string): Promise<CompanyConfig | null> {
    return this.companyConfigRepository.findOne({ where: { uuid } });
  }

  findCompanyConfigByKey(
    company_id: number,
    key: string,
  ): Promise<CompanyConfig | null> {
    return this.companyConfigRepository.findOne({ where: { company_id, key } });
  }

  findActiveCompanyConfigs(company_id: number): Promise<CompanyConfig[]> {
    return this.companyConfigRepository.find({
      where: { company_id, is_active: true },
      order: { key: 'ASC' },
    });
  }

  findActiveCompanyConfigValue(
    companyUuid: string,
    key: string,
  ): Promise<CompanyConfig | null> {
    return this.companyConfigRepository.findOne({
      where: { company: { uuid: companyUuid }, key, is_active: true },
    });
  }
}
