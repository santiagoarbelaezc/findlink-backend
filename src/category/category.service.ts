import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCategory } from './entities/user-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(UserCategory)
    private categoryRepository: Repository<UserCategory>,
    private userService: UserService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<UserCategory> {
    try {
      // Verificar que el usuario existe
      await this.userService.findOne(createCategoryDto.userId);

      // Normalizar slug
      const slug = this.normalizeSlug(createCategoryDto.name);

      // Verificar si ya existe una categoría con el mismo slug para este usuario
      const existingCategory = await this.categoryRepository.findOne({
        where: { userId: createCategoryDto.userId, slug },
      });

      if (existingCategory) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }

      const category = this.categoryRepository.create({
        ...createCategoryDto,
        slug,
      });

      return await this.categoryRepository.save(category);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al crear la categoría',
        error.message,
      );
    }
  }

  async findAll(
    userId?: string,
    type?: string,
    featured?: boolean,
  ): Promise<UserCategory[]> {
    const query = this.categoryRepository.createQueryBuilder('category');

    if (userId) {
      query.where('category.userId = :userId', { userId });
    }

    if (type) {
      query.andWhere('category.type = :type', { type });
    }

    if (featured !== undefined) {
      query.andWhere('category.isFeatured = :featured', { featured });
    }

    return await query.orderBy('category.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<UserCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  async findByUserId(userId: string): Promise<UserCategory[]> {
    return await this.categoryRepository.find({
      where: { userId },
      order: { isFeatured: 'DESC', createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<UserCategory> {
    const category = await this.findOne(id);

    // Si se actualiza el nombre, recalcular slug
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      updateCategoryDto.slug = this.normalizeSlug(updateCategoryDto.name);
    }

    Object.assign(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
  }

  async toggleFeatured(id: string): Promise<UserCategory> {
    const category = await this.findOne(id);
    category.isFeatured = !category.isFeatured;

    return await this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
  }

  private normalizeSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}