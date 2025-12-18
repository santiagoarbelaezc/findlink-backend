import {
  IsArray,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class LinkOrder {
  @ApiProperty({
    description: 'ID del link',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Nueva posición del link',
    example: 2,
  })
  order: number;
}

export class ReorderLinksDto {
  @ApiProperty({
    description: 'ID del usuario dueño de los links',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Array con los nuevos órdenes de los links',
    type: [LinkOrder],
    example: [
      { id: '550e8400-e29b-41d4-a716-446655440000', order: 0 },
      { id: '550e8400-e29b-41d4-a716-446655440001', order: 1 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LinkOrder)
  linkOrders: LinkOrder[];
}