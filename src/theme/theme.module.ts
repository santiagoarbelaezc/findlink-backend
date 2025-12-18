import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theme } from './entities/theme.entity';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { UserModule } from '../user/user.module'; // Importamos UserModule si necesitamos UserService

@Module({
  imports: [
    TypeOrmModule.forFeature([Theme]),
    UserModule, // Solo si ThemeService necesita UserService
  ],
  controllers: [ThemeController],
  providers: [ThemeService],
  exports: [ThemeService],
})
export class ThemeModule {}