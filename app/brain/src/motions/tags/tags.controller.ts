import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth';
import { TagsService } from './tags.service';

@Controller('motions/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @AllowAnonymous()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  @AllowAnonymous()
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Post()
  @Roles(['admin'])
  create(@Body() body: { name?: unknown }) {
    return this.tagsService.create(body?.name);
  }

  @Patch(':id')
  @Roles(['admin'])
  update(@Param('id') id: string, @Body() body: { name?: unknown }) {
    return this.tagsService.update(id, body?.name);
  }

  @Delete(':id')
  @Roles(['admin'])
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.tagsService.remove(id);
  }
}
