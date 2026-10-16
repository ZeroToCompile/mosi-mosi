import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { auth } from './auth';
import { DatabaseModule } from './database/database.module';
import { MotionsModule } from './motions/motions.module';
import { TagsModule } from './motions/tags/tags.module';
import { ThemesModule } from './motions/themes/themes.module';
import { TournamentsModule } from './tournaments/tournaments.module';

@Module({
  imports: [
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: { limit: '2mb' },
        urlencoded: { limit: '2mb', extended: true },
      },
    }),
    DatabaseModule,
    ThemesModule,
    TagsModule,
    MotionsModule,
    TournamentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
