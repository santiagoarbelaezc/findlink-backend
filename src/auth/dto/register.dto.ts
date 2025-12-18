import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsEmail, 
  MinLength, 
  MaxLength, 
  Matches, 
  IsOptional 
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre de usuario único',
    example: 'johndoe',
    minLength: 3,
    maxLength: 30
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username solo puede contener letras, números y guiones bajos'
  })
  username: string;

  @ApiProperty({
    description: 'Nombre para mostrar',
    example: 'John Doe',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName: string;

  @ApiProperty({
    description: 'Correo electrónico único',
    example: 'john@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña',
    example: 'Password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Biografía del usuario',
    example: 'Desarrollador full stack',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({
    description: 'URL del avatar',
    example: 'https://example.com/avatar.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}