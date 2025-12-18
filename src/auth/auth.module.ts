import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';  
import { AuthController } from './auth.controller';  
import { JwtStrategy } from './strategies/jwt.strategy';  
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';  
import { GoogleStrategy } from './strategies/google.strategy'; 
import { JwtAuthGuard } from './guards/jwt-auth.guard';  
import { UserModule } from './../user/user.module';  

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Función para convertir string a segundos
        const stringToSeconds = (timeString: string): number => {
          const unit = timeString.slice(-1);
          const value = parseInt(timeString.slice(0, -1), 10) || 7;
          
          switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 3600;
            case 'd': return value * 86400;
            case 'w': return value * 604800;
            default: return 7 * 86400; // 7 días por defecto
          }
        };
        
        const expiresInString = configService.get<string>('JWT_EXPIRATION', '7d');
        const expiresInSeconds = stringToSeconds(expiresInString);
        
        return {
          secret: configService.get<string>('JWT_SECRET', 'default_secret'),
          signOptions: {
            expiresIn: expiresInSeconds, // <-- DEBE ser NÚMERO, no string
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
    JwtAuthGuard,
  ],
})
export class AuthModule {}