import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('links')
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column({ default: '🔗' })
  icon: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: 0 })
  clicks: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  backgroundColor: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relación
  @ManyToOne(() => User, (user) => user.links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Métodos
  incrementClicks() {
    this.clicks += 1;
  }

  updateOrder(newOrder: number) {
    this.order = newOrder;
  }
}