import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    // Configurar la estrategia para refresh tokens
    const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET', '');
    
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: refreshSecret,
      passReqToCallback: true, // Importante para obtener el request en validate
    });
  }

  async validate(req: Request, payload: any) {
    try {
      // Obtener el refresh token del body
      const refreshToken = (req as any).body?.refreshToken;
      
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token no proporcionado');
      }

      // Verificar que el usuario exista
      const user = await this.userService.findOne(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return { 
        ...payload, 
        refreshToken,
        userId: payload.sub,
      };
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}