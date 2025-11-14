import { PartialType } from '@nestjs/swagger';
import { CreateModuleCategoryDto } from './create-module-category.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateModuleCategoryDto extends PartialType(CreateModuleCategoryDto) {

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
