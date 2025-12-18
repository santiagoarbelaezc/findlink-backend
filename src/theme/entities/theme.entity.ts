import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('themes')
export class Theme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ default: '#6366f1' })
  primaryColor: string;

  @Column({ default: '#ffffff' })
  backgroundColor: string;

  @Column({ default: 'rounded' })
  buttonStyle: 'rounded' | 'square' | 'pill';

  @Column({ default: 'system-ui' })
  fontFamily: string;

  @Column({ default: true })
  showAnimations: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación
  @OneToOne(() => User, (user) => user.theme)
  @JoinColumn({ name: 'userId' })
  user: User;
}