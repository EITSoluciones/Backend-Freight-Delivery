// common/dto/success-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty()
  pageNumber: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  hasPreviousPage: boolean;

  @ApiProperty()
  hasNextPage: boolean;
}

export class SuccessResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operación exitosa' })
  message: string;

  @ApiProperty()
  data: T;

  @ApiPropertyOptional({ type: PaginationMeta })
  pagination?: PaginationMeta;

  constructor(
    success: boolean,
    message: string,
    data: T,
    pagination?: PaginationMeta,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    if (pagination) {
      this.pagination = pagination;
    }
  }
}

export class PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;

  static create<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Operación exitosa',
  ): PaginatedResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination: {
        pageNumber: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasPreviousPage: page > 1,
        hasNextPage: total > page * limit,
      },
    };
  }
}
