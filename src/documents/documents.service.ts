import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentType } from './enums/document-type.enum';

export interface UploadFileOptions {
  file: Express.Multer.File;
  folder?: string;
  documentType?: DocumentType;
  description?: string;
}

export interface UploadResult {
  document: Document;
  filePath: string;
  url: string;
}

@Injectable()
export class DocumentsService implements OnModuleInit {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureUploadDirectory(this.uploadDir);
  }

  private async ensureUploadDirectory(dir: string): Promise<void> {
    try {
      await fs.promises.access(dir);
    } catch {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }

  private normalizeFolder(folder?: string): string {
    const normalized = (folder ?? 'general')
      .replace(/\\/g, '/')
      .split('/')
      .map((segment) =>
        segment
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '_'),
      )
      .filter(Boolean)
      .join('/');

    return normalized || 'general';
  }

  private getExtension(filename: string): string | null {
    const extension = path.extname(filename).toLowerCase().replace('.', '');
    return extension || null;
  }

  private buildStoredFilename(extension?: string | null): string {
    const token = crypto.randomUUID();
    return extension ? `${token}.${extension}` : token;
  }

  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const {
      file,
      folder = 'general',
      documentType = DocumentType.OTHER,
      description,
    } = options;

    if (!file) {
      throw new BadRequestException('Debes enviar un archivo');
    }

    if (!file.buffer || file.size <= 0) {
      throw new BadRequestException('El archivo enviado es inválido');
    }

    const safeFolder = this.normalizeFolder(folder);
    const extension = this.getExtension(file.originalname);
    const storedFilename = this.buildStoredFilename(extension);

    const targetDir = path.join(this.uploadDir, safeFolder);
    await this.ensureUploadDirectory(targetDir);

    const absoluteFilePath = path.join(targetDir, storedFilename);
    const relativePath = path.join(safeFolder, storedFilename).replace(/\\/g, '/');

    await fs.promises.writeFile(absoluteFilePath, file.buffer);

    try {
      const document = this.documentRepository.create({
        original_name: file.originalname,
        file_path: relativePath,
        mime_type: file.mimetype,
        size: file.size,
        extension,
        document_type: documentType,
        folder: safeFolder,
        description: description?.trim() || null,
        is_active: true,
      });

      const savedDocument = await this.documentRepository.save(document);

      return {
        document: savedDocument,
        filePath: relativePath,
        url: '',
      };
    } catch (error) {
      await fs.promises.unlink(absoluteFilePath).catch(() => undefined);
      throw error;
    }
  }

  async findByUuid(uuid: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { uuid, is_active: true },
    });

    if (!document) {
      throw new NotFoundException(`Documento con uuid ${uuid} no encontrado`);
    }

    return document;
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

  async deleteByUuid(uuid: string): Promise<void> {
    const document = await this.findByUuid(uuid);
    const fullPath = path.join(this.uploadDir, document.file_path);

    try {
      await fs.promises.unlink(fullPath);
    } catch {
      // si no existe físico, seguimos
    }

    document.is_active = false;
    await this.documentRepository.save(document);
    await this.documentRepository.softRemove(document);
  }
}