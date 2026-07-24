import { IsDateString, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class QueryCustomerDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
