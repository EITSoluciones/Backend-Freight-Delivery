import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateModuleCategoryDto {

    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}
