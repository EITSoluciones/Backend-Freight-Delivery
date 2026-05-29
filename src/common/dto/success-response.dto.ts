// common/dto/success-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty()
  page_number!: number;

  @ApiProperty()
  total_pages!: number;

  @ApiProperty()
  total_count!: number;

  @ApiProperty()
  has_previous_page!: boolean;

  @ApiProperty()
  has_next_page!: boolean;
}

export class SuccessResponseDto<T> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Operación exitosa' })
  message!: string;

  @ApiProperty()
  data!: T;

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
  success!: boolean;
  message!: string;
  data!: T[];
  pagination!: PaginationMeta;

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
        page_number: page,
        total_pages: Math.ceil(total / limit),
        total_count: total,
        has_previous_page: page > 1,
        has_next_page: total > page * limit,
      },
    };
  }
}
