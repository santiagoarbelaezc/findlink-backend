import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ThemeModule } from './theme/theme.module';
import { LinkModule } from './link/link.module';
import { CategoryModule } from './category/category.module';

// IMPORTA LAS ENTIDADES DIRECTAMENTE
import { User } from './user/entities/user.entity';
import { Theme } from './theme/entities/theme.entity';
import { Link } from './link/entities/link.entity';
import { UserCategory } from './category/entities/user-category.entity';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // TypeORM - CONFIGURACIÓN FIXED
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        
        // MÁS IMPORTANTE: Especifica las entidades manualmente
        entities: [
          User,
          Theme,
          Link,
          UserCategory
        ],
        
        // Fuerza synchronize a true temporalmente
        synchronize: true,  // <- CAMBIA ESTO DE FORMA TEMPORAL
        
        // Configuración SSL para Neon
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          connectionLimit: 5,
        },
        
        // Activa logging para ver las queries
        logging: ['query', 'error'],
      }),
      inject: [ConfigService],
    }),
    
    // Módulos de la aplicación
    UserModule,
    ThemeModule,
    LinkModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}