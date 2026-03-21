import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentType } from './enums/document-type.enum';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

export interface UploadFileOptions {
  file: Express.Multer.File;
  folder?: string;
  documentType?: DocumentType;
  description?: string;
  entityType?: string;
  entityUuid?: string;
}

export interface UploadResult {
  document: Document;
  filePath: string;
  url: string;
}

@Injectable()
export class DocumentsService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    this.ensureUploadDirectory(this.uploadDir);
  }

  private async ensureUploadDirectory(dir: string): Promise<void> {
    try {
      await fs.promises.access(dir);
    } catch {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }

  private getExtension(filename: string): string {
    return path.extname(filename).toLowerCase().slice(1);
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      csv: 'text/csv',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const {
      file,
      folder = 'general',
      documentType = DocumentType.OTHER,
      description,
    } = options;

    const fileUuid = uuidv4();
    const extension = this.getExtension(file.originalname);
    const mimeType = file.mimetype || this.getMimeType(extension);
    const newFilename = `${fileUuid}.${extension}`;

    const targetDir = path.join(this.uploadDir, folder);
    this.ensureUploadDirectory(targetDir);

    const filePath = path.join(targetDir, newFilename);
    const relativePath = path.join(folder, newFilename).replace(/\\/g, '/');

    await fs.promises.writeFile(filePath, file.buffer);

    const document = this.documentRepository.create({
      uuid: fileUuid,
      original_name: file.originalname,
      file_path: relativePath,
      mime_type: mimeType,
      size: file.size,
      extension,
      document_type: documentType,
      folder,
      description,
    });

    const savedDocument = await this.documentRepository.save(document);

    return {
      document: savedDocument,
      filePath: relativePath,
      url: `${this.baseUrl}/uploads/${relativePath}`,
    };
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile({ file, folder }),
    );
    return Promise.all(uploadPromises);
  }

  async findByUuid(uuid: string): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { uuid } });
    if (!document) {
      throw new NotFoundException(`Documento con uuid ${uuid} no encontrado`);
    }
    return document;
  }

  async findById(id: number): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Documento con id ${id} no encontrado`);
    }
    return document;
  }

  async delete(uuid: string): Promise<void> {
    const document = await this.findByUuid(uuid);

    const fullPath = path.join(this.uploadDir, document.file_path);
    try {
      await fs.promises.unlink(fullPath);
    } catch {
      // File may not exist, continue with soft delete
    }

    await this.documentRepository.softDelete({ uuid });
  }

  async getFilePath(uuid: string): Promise<string> {
    const document = await this.findByUuid(uuid);
    return path.join(this.uploadDir, document.file_path);
  }

  async findByType(documentType: DocumentType): Promise<Document[]> {
    return this.documentRepository.find({
      where: { document_type: documentType, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByFolder(folder: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { folder, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async updateDescription(
    uuid: string,
    description: string,
  ): Promise<Document> {
    const document = await this.findByUuid(uuid);
    document.description = description;
    return this.documentRepository.save(document);
  }

  async getAbsolutePath(document: Document): Promise<string> {
    return path.join(this.uploadDir, document.file_path);
  }

  async fileExists(document: Document): Promise<boolean> {
    const fullPath = path.join(this.uploadDir, document.file_path);
    try {
      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
