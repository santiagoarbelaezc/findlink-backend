import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('user_categories')
export class UserCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({
    type: 'enum',
    enum: ['skill', 'interest', 'profession'],
    default: 'interest',
  })
  type: 'skill' | 'interest' | 'profession';

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relación
  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Método para normalizar slug
  normalizeSlug() {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  // Método para respuesta
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      type: this.type,
      isFeatured: this.isFeatured,
    };
  }
}