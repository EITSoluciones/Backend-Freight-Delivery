import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ValidateActivationCodeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  code!: string;
}
