import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { DocumentsRepository } from './repositories/documents.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    MulterModule.register({
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
      },
    }),
  ],
  providers: [DocumentsService, DocumentsRepository],
  exports: [DocumentsService, DocumentsRepository],
})
export class DocumentsModule {}
