import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Theme } from '../../theme/entities/theme.entity';
import { Link } from '../../link/entities/link.entity';
import { UserCategory } from '../../category/entities/user-category.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  displayName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  avatarUrl: string;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: 0 })
  profileViews: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToOne(() => Theme, (theme) => theme.user, { cascade: true })
  theme: Theme;

  @OneToMany(() => Link, (link) => link.user, { cascade: true })
  links: Link[];

  @OneToMany(() => UserCategory, (category) => category.user, { cascade: true })
  categories: UserCategory[];

  // Métodos (opcional, se pueden hacer en service)
  getPublicProfile() {
    return {
      id: this.id,
      username: this.username,
      displayName: this.displayName,
      bio: this.bio,
      avatarUrl: this.avatarUrl,
      isPublic: this.isPublic,
      profileViews: this.profileViews,
    };
  }

  incrementProfileViews() {
    this.profileViews += 1;
  }
}