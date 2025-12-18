import { PartialType } from '@nestjs/mapped-types';
import { CreateThemeDto } from './create-theme.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateThemeDto extends PartialType(CreateThemeDto) {
  @ApiProperty({
    description: 'ID del usuario (no se puede cambiar)',
    required: false,
  })
  userId?: string;
}