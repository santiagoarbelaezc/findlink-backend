import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);
      
      if (!user) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      // Eliminar passwordHash de la respuesta
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const tokens = await this.generateTokens(user);
    
    return new TokenResponseDto({
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  }

  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userService.findByEmailOrUsername(
        registerDto.email,
        registerDto.username,
      );

      if (existingUser) {
        throw new ConflictException('El email o username ya están en uso');
      }

      // Convertir RegisterDto a CreateUserDto
      const createUserDto: CreateUserDto = {
        username: registerDto.username,
        displayName: registerDto.displayName,
        email: registerDto.email,
        password: registerDto.password,
        bio: registerDto.bio || '',
        avatarUrl: registerDto.avatarUrl || '',
        isPublic: true,
      };

      const user = await this.userService.create(createUserDto);

      // Generar tokens
      const tokens = await this.generateTokens(user);
      
      return new TokenResponseDto({
        ...tokens,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al registrar usuario');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET', ''),
        },
      );

      const user = await this.userService.findOne(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const tokens = await this.generateTokens(user);
      
      return new TokenResponseDto({
        ...tokens,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async googleLogin(googleUser: any): Promise<TokenResponseDto> {
    try {
      let user = await this.userService.findByEmail(googleUser.email);

      if (!user) {
        // Crear usuario si no existe
        const username = this.generateUsernameFromEmail(googleUser.email);
        
        // Crear objeto compatible con CreateUserDto
        const createUserDto: CreateUserDto = {
          username,
          displayName: googleUser.displayName || googleUser.email,
          email: googleUser.email,
          password: Math.random().toString(36).slice(2), // Contraseña aleatoria
          bio: `Usuario registrado con Google`,
          avatarUrl: googleUser.picture || '',
          isPublic: true,
        };

        user = await this.userService.create(createUserDto);
      }

      const tokens = await this.generateTokens(user);
      
      return new TokenResponseDto({
        ...tokens,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException('Error en autenticación con Google');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    // Aquí podrías invalidar tokens si usas una blacklist
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const currentUserId = userId; // Variable utilizada
    return { message: 'Sesión cerrada exitosamente' };
  }

  async getUserProfile(userId: string): Promise<any> {
    return this.userService.findOne(userId);
  }

  private async generateTokens(user: any): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    // Obtener los tiempos de expiración como números
    const jwtExpiresIn = this.parseJwtExpiresIn(this.configService.get<string>('JWT_EXPIRATION', '7d'));
    const refreshExpiresIn = this.parseJwtExpiresIn(this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d'));

    const accessToken = await this.jwtService.signAsync(
      payload,
      {
        secret: this.configService.get<string>('JWT_SECRET', ''),
        expiresIn: jwtExpiresIn,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      payload,
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', ''),
        expiresIn: refreshExpiresIn,
      },
    );

    // Calcular expiresIn en segundos para la respuesta
    const expiresIn = this.calculateExpiresInSeconds(
      this.configService.get<string>('JWT_EXPIRATION', '7d')
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private parseJwtExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1), 10);

    switch (unit) {
      case 's': return value; // segundos
      case 'm': return value * 60; // minutos
      case 'h': return value * 3600; // horas
      case 'd': return value * 86400; // días
      case 'w': return value * 604800; // semanas
      default: return 3600; // 1 hora por defecto
    }
  }

  private calculateExpiresInSeconds(expiresIn: string): number {
    return this.parseJwtExpiresIn(expiresIn);
  }

  private generateUsernameFromEmail(email: string): string {
    const username = email.split('@')[0];
    // Limpiar caracteres especiales
    return username.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  }
}