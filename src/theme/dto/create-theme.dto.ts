import {
  IsString,
  IsUUID,
  IsHexColor,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateThemeDto {
  @ApiProperty({
    description: 'ID del usuario dueño del tema',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Color primario en formato hexadecimal',
    example: '#6366f1',
    default: '#6366f1',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  primaryColor?: string = '#6366f1';

  @ApiProperty({
    description: 'Color de fondo en formato hexadecimal',
    example: '#ffffff',
    default: '#ffffff',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  backgroundColor?: string = '#ffffff';

  @ApiProperty({
    description: 'Estilo de los botones',
    enum: ['rounded', 'square', 'pill'],
    example: 'rounded',
    default: 'rounded',
  })
  @IsOptional()
  @IsEnum(['rounded', 'square', 'pill'])
  buttonStyle?: 'rounded' | 'square' | 'pill' = 'rounded';

  @ApiProperty({
    description: 'Familia de fuentes',
    example: 'system-ui, -apple-system, sans-serif',
    default: 'system-ui',
  })
  @IsOptional()
  @IsString()
  fontFamily?: string = 'system-ui';

  @ApiProperty({
    description: 'Mostrar animaciones',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  showAnimations?: boolean = true;
}