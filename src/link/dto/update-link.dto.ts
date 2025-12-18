import { PartialType } from '@nestjs/mapped-types';
import { CreateLinkDto } from './create-link.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLinkDto extends PartialType(CreateLinkDto) {
  @ApiProperty({
    description: 'ID del usuario (no se puede cambiar)',
    required: false,
  })
  userId?: string;
}