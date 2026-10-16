import { Module } from '@nestjs/common';
import { MotionsController } from './motions.controller';
import { MotionsService } from './motions.service';

@Module({
  controllers: [MotionsController],
  providers: [MotionsService],
  exports: [MotionsService],
})
export class MotionsModule {}
