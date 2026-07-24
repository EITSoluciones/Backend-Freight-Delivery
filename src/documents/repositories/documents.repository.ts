import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Document } from '../entities/document.entity';

@Injectable()
export class DocumentsRepository {
  constructor(
    @InjectRepository(Document)
    private readonly repository: Repository<Document>,
  ) {}

  create(document: DeepPartial<Document>): Document {
    return this.repository.create(document);
  }

  save(document: Document): Promise<Document> {
    return this.repository.save(document);
  }

  findActiveByUuid(uuid: string): Promise<Document | null> {
    return this.repository.findOne({ where: { uuid, is_active: true } });
  }

  softRemove(document: Document): Promise<Document> {
    return this.repository.softRemove(document);
  }
}
