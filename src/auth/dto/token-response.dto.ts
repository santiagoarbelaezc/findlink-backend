import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    description: 'Access token JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token para renovar el access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Tiempo de expiración en segundos',
    example: 3600
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Tipo de token',
    example: 'Bearer'
  })
  tokenType: string = 'Bearer';

  @ApiProperty({
    description: 'Información del usuario autenticado'
  })
  user: any;

  constructor(partial: Partial<TokenResponseDto>) {
    Object.assign(this, partial);
  }
}