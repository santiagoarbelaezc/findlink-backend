import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', ''),
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.userService.findOne(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Eliminar passwordHash de la respuesta
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}