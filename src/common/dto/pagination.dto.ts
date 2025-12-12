import { Transform, Type } from "class-transformer";
import { IsBoolean, IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsPositive()
    @Min(1)
    @Type(() => Number)
    page?: number;

    @IsOptional()
    declare is_active?: string;

}
