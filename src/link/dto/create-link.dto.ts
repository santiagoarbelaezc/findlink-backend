import {
  IsString,
  IsUUID,
  IsUrl,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkDto {
  @ApiProperty({
    description: 'ID del usuario dueño del link',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Título del link',
    example: 'Mi Portfolio',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'URL del link',
    example: 'https://portfolio.example.com',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Ícono (emoji o nombre)',
    example: '🚀',
    default: '🔗',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string = '🔗';

  @ApiProperty({
    description: 'Posición en el orden (0-based)',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number = 0;

  @ApiProperty({
    description: 'Si el link está activo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Color de fondo personalizado (hex)',
    example: '#3b82f6',
    required: false,
  })
  @IsOptional()
  @IsString()
  backgroundColor?: string;
}