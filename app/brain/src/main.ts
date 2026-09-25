import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Better Auth needs the raw body; AuthModule re-adds parsers for other routes.
    bodyParser: false,
  });

  const corsOrigins = (
    process.env.BETTER_AUTH_TRUSTED_ORIGINS ??
    process.env.WEB_URL ??
    'http://localhost:3020'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
