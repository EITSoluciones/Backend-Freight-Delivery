import { IsBoolean, IsInt, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateModuleDto {

    @IsOptional()
    @IsInt()
    module_category_id?: number;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsUrl()
    url?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
