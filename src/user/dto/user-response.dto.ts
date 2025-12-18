import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'John Doe' })
  displayName: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'Desarrollador full stack' })
  bio: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatarUrl: string;

  @ApiProperty({ example: true })
  isPublic: boolean;

  @ApiProperty({ example: 150 })
  profileViews: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.username = user.username;
    this.displayName = user.displayName;
    this.email = user.email;
    this.bio = user.bio;
    this.avatarUrl = user.avatarUrl;
    this.isPublic = user.isPublic;
    this.profileViews = user.profileViews;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}