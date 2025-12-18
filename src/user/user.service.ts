import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.usersRepository.findOne({
        where: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      });

      if (existingUser) {
        throw new ConflictException(
          'El nombre de usuario o email ya está en uso',
        );
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Crear usuario
      const user = this.usersRepository.create({
        ...createUserDto,
        passwordHash: hashedPassword,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al crear el usuario',
        error.message,
      );
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const query = this.usersRepository.createQueryBuilder('user');

    if (search) {
      query.where(
        'user.username ILIKE :search OR user.displayName ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['theme', 'links', 'categories'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['theme', 'links', 'categories'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario ${username} no encontrado`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Si se actualiza la contraseña, hashear
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      delete updateUserDto.password;
    }

    // Actualizar campos
    Object.assign(user, updateUserDto);

    return await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  async incrementProfileViews(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.profileViews += 1;
    return await this.usersRepository.save(user);
  }

  async getPublicProfile(id: string): Promise<any> {
    const user = await this.findOne(id);
    
    if (!user.isPublic) {
      throw new NotFoundException('Perfil no disponible');
    }

    // Incrementar vistas
    await this.incrementProfileViews(id);

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      profileViews: user.profileViews,
      createdAt: user.createdAt,
      theme: user.theme,
      links: user.links?.filter(link => link.isActive) || [],
      categories: user.categories?.filter(cat => cat.isFeatured) || [],
    };
  }

  async getUserLinks(id: string): Promise<any[]> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['links'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user.links
      ?.filter(link => link.isActive)
      .sort((a, b) => a.order - b.order) || [];
  }
}