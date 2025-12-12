import {
  IsOptional,
  IsBoolean,
  IsDateString
} from 'class-validator';
import {
  PaginationDto
} from 'src/common/dto/pagination.dto';
import {
  Transform
} from 'class-transformer';

export class QueryClientDto extends PaginationDto {

  @IsOptional()
  declare is_active?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}