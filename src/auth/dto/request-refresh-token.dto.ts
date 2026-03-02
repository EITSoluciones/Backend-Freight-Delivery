import { IsNotEmpty, IsString } from "class-validator";

export class RequestRefreshTokenDto {
    @IsNotEmpty({ message: 'El token de refresh es obligatorio.' })
    @IsString()
    refresh_token:string;
}
