import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CreateFiscalAddressDto,
} from './dto';
import {
  CreateCompanyConfigDto,
  UpdateCompanyConfigDto,
} from './dto/company-config.dto';
import { UploadCompanyDocumentDto } from './dto/upload-company-document.dto';
import { Auth } from '../auth/decorators';
import { Permissions } from '../auth/interfaces';

@ApiTags('Companies')
@Controller({
  path: 'companies',
  version: '1',
})
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  // ============ COMPANY ============
  @Post()
  @Auth(Permissions.CompanyCreate)
  create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Get()
  @Auth(Permissions.CompanyView)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.companyService.findAll(paginationDto);
  }

  @Get(':uuid')
  @Auth(Permissions.CompanyView)
  findOne(@Param('uuid') uuid: string) {
    return this.companyService.findOne(uuid);
  }

  @Patch(':uuid')
  @Auth(Permissions.CompanyUpdate)
  update(@Param('uuid') uuid: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(uuid, dto);
  }

  @Delete(':uuid')
  @Auth(Permissions.CompanyDelete)
  remove(@Param('uuid') uuid: string) {
    return this.companyService.remove(uuid);
  }

  // ============ FISCAL ADDRESSES ============
  @Post(':uuid/fiscal-addresses')
  @Auth(Permissions.CompanyUpdate)
  createFiscalAddress(
    @Param('uuid') uuid: string,
    @Body() dto: CreateFiscalAddressDto,
  ) {
    return this.companyService.createFiscalAddress(uuid, dto);
  }

  @Patch('fiscal-addresses/:addressUuid')
  @Auth(Permissions.CompanyUpdate)
  updateFiscalAddress(
    @Param('addressUuid') addressUuid: string,
    @Body() dto: Partial<CreateFiscalAddressDto>,
  ) {
    return this.companyService.updateFiscalAddress(addressUuid, dto);
  }

  @Delete('fiscal-addresses/:addressUuid')
  @Auth(Permissions.CompanyDelete)
  deleteFiscalAddress(@Param('addressUuid') addressUuid: string) {
    return this.companyService.deleteFiscalAddress(addressUuid);
  }

  @Get(':uuid/fiscal-addresses/default')
  @Auth(Permissions.CompanyView)
  getDefaultFiscalAddress(@Param('uuid') uuid: string) {
    return this.companyService.getDefaultFiscalAddress(uuid);
  }

  // ============ DOCUMENTS ============
  @Post(':uuid/documents')
  @Auth(Permissions.CompanyUpdate)
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Param('uuid') uuid: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadCompanyDocumentDto,
  ) {
    return this.companyService.uploadDocument(uuid, file, dto);
  }

  @Get(':uuid/documents')
  @Auth(Permissions.CompanyView)
  getDocuments(@Param('uuid') uuid: string) {
    return this.companyService.getDocuments(uuid);
  }

  @Delete('documents/:documentUuid')
  @Auth(Permissions.CompanyDelete)
  deleteDocument(@Param('documentUuid') documentUuid: string) {
    return this.companyService.deleteDocument(documentUuid);
  }


}
