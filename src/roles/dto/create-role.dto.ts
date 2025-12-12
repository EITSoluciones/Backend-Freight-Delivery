import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateRoleDto {

    @IsNotEmpty({ message: 'El Código es obligatorio.' })
    @IsString()
    @MaxLength(50)
    code: string;

    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

}
