import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth';
import { MotionsService } from './motions.service';

@Controller('motions')
export class MotionsController {
  constructor(private readonly motionsService: MotionsService) {}

  @Get()
  @AllowAnonymous()
  findAll(
    @Query('query') query?: string,
    @Query('format') format?: string,
    @Query('theme') theme?: string,
    @Query('difficulty') difficulty?: string,
    @Query('sort') sort?: string,
  ) {
    return this.motionsService.findAll({
      query,
      format,
      theme,
      difficulty,
      sort,
    });
  }

  @Get(':id')
  @AllowAnonymous()
  findOne(@Param('id') id: string) {
    return this.motionsService.findOne(id);
  }

  @Post()
  @Roles(['admin'])
  create(@Body() body: unknown) {
    return this.motionsService.create(body);
  }

  @Patch(':id')
  @Roles(['admin'])
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.motionsService.update(id, body);
  }

  @Delete(':id')
  @Roles(['admin'])
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.motionsService.remove(id);
  }
}
