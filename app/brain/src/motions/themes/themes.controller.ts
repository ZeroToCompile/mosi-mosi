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
import { ThemesService } from './themes.service';

@Controller('motions/themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get()
  @AllowAnonymous()
  findAll() {
    return this.themesService.findAll();
  }

  @Get(':id')
  @AllowAnonymous()
  findOne(@Param('id') id: string) {
    return this.themesService.findOne(id);
  }

  @Post()
  @Roles(['admin'])
  create(@Body() body: { name?: unknown }) {
    return this.themesService.create(body?.name);
  }

  @Patch(':id')
  @Roles(['admin'])
  update(@Param('id') id: string, @Body() body: { name?: unknown }) {
    return this.themesService.update(id, body?.name);
  }

  @Delete(':id')
  @Roles(['admin'])
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.themesService.remove(id);
  }
}
