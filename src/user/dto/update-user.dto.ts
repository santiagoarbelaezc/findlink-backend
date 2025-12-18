import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Nueva contraseña (opcional)',
    example: 'NewPassword123',
    required: false,
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    description: 'Contraseña actual (requerida para cambios sensibles)',
    example: 'CurrentPassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;
}