import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'El Código es obligatorio.' })
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase().replace(/\s+/g, '_')
      : value,
  )
  code!: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
