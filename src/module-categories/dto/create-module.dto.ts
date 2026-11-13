import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateModuleDto {
  @IsNotEmpty()
  @IsUUID()
  module_category_uuid!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  icon!: string;

  @IsNotEmpty()
  @IsString()
  url!: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
