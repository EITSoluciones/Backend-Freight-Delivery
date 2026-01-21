import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class UpdateModuleDto {

    @IsOptional()
    @IsUUID()
    module_category_uuid?: string;

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
    url?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
