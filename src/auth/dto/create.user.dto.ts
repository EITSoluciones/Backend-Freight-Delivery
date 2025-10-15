import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class CreateUserDto {

    @IsNotEmpty({ message: 'Username es obligatorio.' })
    @IsString()
    username: string;

    @IsNotEmpty({ message: 'Email es obligatorio' })
    @IsEmail({}, { message: 'Email inválido' })
    email: string;

    @IsNotEmpty({ message: 'La contraseña es obligatorio' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @MaxLength(50, { message: 'La contraseña debe tener al máximo 6 caracteres' })
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'La contraseña debe contener mayúscula, minúscula y al menos un número o carácter especial'
    })
    password: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    last_name?: string;


}