import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json } from 'body-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { validationPipe } from './common/pipes/validation.pipe';

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

function validateEnvironment() {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(
      `FATAL: Missing required environment variables: ${missing.join(', ')}`,
    );
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'true') {
    console.error(
      'FATAL: COOKIE_SECURE must be true when NODE_ENV is production',
    );
    process.exit(1);
  }

  console.log('Environment validation passed');
}

validateEnvironment();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3001);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigin = configService.get<string>('app.corsOrigin', 'http://localhost:3000');

  app.setGlobalPrefix(apiPrefix);
  app.use(cookieParser());
  app.use(helmet());
  app.use(json({ limit: '1mb' }));
  app.enableCors({ origin: corsOrigin, credentials: true });
  app.useGlobalPipes(validationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor(), new TimingInterceptor());

  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}

bootstrap();
