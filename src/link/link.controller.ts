import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';

@Controller('links')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createLinkDto: CreateLinkDto) {
    return this.linkService.create(createLinkDto);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('active') active?: boolean,
  ) {
    return this.linkService.findAll(userId, active);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.linkService.findOne(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.linkService.findByUserId(userId);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, skipMissingProperties: true }))
  update(@Param('id') id: string, @Body() updateLinkDto: UpdateLinkDto) {
    return this.linkService.update(id, updateLinkDto);
  }

  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.linkService.toggleActive(id);
  }

  @Post(':id/increment-clicks')
  @HttpCode(HttpStatus.OK)
  incrementClicks(@Param('id') id: string) {
    return this.linkService.incrementClicks(id);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  reorder(@Body() reorderLinksDto: ReorderLinksDto) {
    return this.linkService.reorder(reorderLinksDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.linkService.remove(id);
  }
}