import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './entities/link.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
    private userService: UserService,
  ) {}

  async create(createLinkDto: CreateLinkDto): Promise<Link> {
    try {
      // Verificar que el usuario existe
      await this.userService.findOne(createLinkDto.userId);

      // Obtener el último order para este usuario
      const lastLink = await this.linkRepository.findOne({
        where: { userId: createLinkDto.userId },
        order: { order: 'DESC' },
      });

      const order = lastLink ? lastLink.order + 1 : 0;

      const link = this.linkRepository.create({
        ...createLinkDto,
        order,
      });

      return await this.linkRepository.save(link);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Usuario no válido');
      }
      throw new InternalServerErrorException(
        'Error al crear el link',
        error.message,
      );
    }
  }

  async findAll(userId?: string, active?: boolean): Promise<Link[]> {
    const query = this.linkRepository.createQueryBuilder('link');

    if (userId) {
      query.where('link.userId = :userId', { userId });
    }

    if (active !== undefined) {
      query.andWhere('link.isActive = :active', { active });
    }

    return await query.orderBy('link.order', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Link> {
    const link = await this.linkRepository.findOne({ where: { id } });

    if (!link) {
      throw new NotFoundException(`Link con ID ${id} no encontrado`);
    }

    return link;
  }

  async findByUserId(userId: string): Promise<Link[]> {
    return await this.linkRepository.find({
      where: { userId },
      order: { order: 'ASC' },
    });
  }

  async update(id: string, updateLinkDto: UpdateLinkDto): Promise<Link> {
    const link = await this.findOne(id);
    
    Object.assign(link, updateLinkDto);
    
    return await this.linkRepository.save(link);
  }

  async toggleActive(id: string): Promise<Link> {
    const link = await this.findOne(id);
    link.isActive = !link.isActive;
    
    return await this.linkRepository.save(link);
  }

  async incrementClicks(id: string): Promise<Link> {
    const link = await this.findOne(id);
    link.clicks += 1;
    
    return await this.linkRepository.save(link);
  }

  async reorder(reorderLinksDto: ReorderLinksDto): Promise<void> {
    const { userId, linkOrders } = reorderLinksDto;

    // Verificar que todos los links pertenecen al usuario
    const links = await this.linkRepository.find({
      where: { userId },
    });

    const linkIds = links.map(link => link.id);
    
    for (const linkOrder of linkOrders) {
      if (!linkIds.includes(linkOrder.id)) {
        throw new BadRequestException(`Link ${linkOrder.id} no pertenece al usuario`);
      }
    }

    // Actualizar órdenes en una transacción
    const updatePromises = linkOrders.map((linkOrder) =>
      this.linkRepository.update(linkOrder.id, { order: linkOrder.order }),
    );

    await Promise.all(updatePromises);
  }

  async remove(id: string): Promise<void> {
    const link = await this.findOne(id);
    
    // Eliminar el link
    await this.linkRepository.delete(id);
    
    // Reordenar los links restantes del usuario
    const remainingLinks = await this.linkRepository.find({
      where: { userId: link.userId },
      order: { order: 'ASC' },
    });

    // Reasignar órdenes
    for (let i = 0; i < remainingLinks.length; i++) {
      remainingLinks[i].order = i;
      await this.linkRepository.save(remainingLinks[i]);
    }
  }
}