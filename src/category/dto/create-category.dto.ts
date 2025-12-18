import {
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'ID del usuario dueño de la categoría',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Nombre de la categoría (tag)',
    example: 'JavaScript',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Tipo de categoría',
    enum: ['skill', 'interest', 'profession'],
    example: 'skill',
    default: 'interest',
  })
  @IsOptional()
  @IsEnum(['skill', 'interest', 'profession'])
  type?: 'skill' | 'interest' | 'profession' = 'interest';

  @ApiProperty({
    description: 'Si la categoría es destacada en el perfil',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;
}