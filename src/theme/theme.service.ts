import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme } from './entities/theme.entity';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ThemeService {
  constructor(
    @InjectRepository(Theme)
    private themeRepository: Repository<Theme>,
    private userService: UserService,
  ) {}

  async create(createThemeDto: CreateThemeDto): Promise<Theme> {
    try {
      // Verificar que el usuario existe
      await this.userService.findOne(createThemeDto.userId);

      // Verificar si ya existe un tema para este usuario
      const existingTheme = await this.themeRepository.findOne({
        where: { userId: createThemeDto.userId },
      });

      if (existingTheme) {
        throw new ConflictException('Este usuario ya tiene un tema configurado');
      }

      const theme = this.themeRepository.create(createThemeDto);
      return await this.themeRepository.save(theme);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al crear el tema',
        error.message,
      );
    }
  }

  async findAll(): Promise<Theme[]> {
    return await this.themeRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Theme> {
    const theme = await this.themeRepository.findOne({ where: { id } });

    if (!theme) {
      throw new NotFoundException(`Tema con ID ${id} no encontrado`);
    }

    return theme;
  }

  async findByUserId(userId: string): Promise<Theme> {
    const theme = await this.themeRepository.findOne({ where: { userId } });

    if (!theme) {
      // Crear tema por defecto si no existe
      return this.createDefaultTheme(userId);
    }

    return theme;
  }

  async update(id: string, updateThemeDto: UpdateThemeDto): Promise<Theme> {
    const theme = await this.findOne(id);
    
    Object.assign(theme, updateThemeDto);
    theme.updatedAt = new Date();
    
    return await this.themeRepository.save(theme);
  }

  async updateByUserId(userId: string, updateThemeDto: UpdateThemeDto): Promise<Theme> {
    let theme = await this.themeRepository.findOne({ where: { userId } });

    if (!theme) {
      // Crear tema si no existe
      theme = this.themeRepository.create({
        userId,
        ...updateThemeDto,
      });
    } else {
      // Actualizar tema existente
      Object.assign(theme, updateThemeDto);
      theme.updatedAt = new Date();
    }

    return await this.themeRepository.save(theme);
  }

  async remove(id: string): Promise<void> {
    const result = await this.themeRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Tema con ID ${id} no encontrado`);
    }
  }

  private async createDefaultTheme(userId: string): Promise<Theme> {
    const theme = this.themeRepository.create({
      userId,
      primaryColor: '#6366f1',
      backgroundColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'system-ui',
      showAnimations: true,
    });

    return await this.themeRepository.save(theme);
  }
}