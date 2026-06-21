import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { RateLimiterGuard } from './common/guards/rate-limiter.guard';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import {
  appConfig,
  authConfig,
  databaseConfig,
  jwtConfig,
  otpConfig,
} from './config';
import { AuditLogsModule } from './modules/audit-logs';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationsModule } from './modules/notifications';
import { ClientsModule } from './modules/clients';
import { ContractsModule } from './modules/contracts';
import { DashboardModule } from './modules/dashboard';
import { DriversModule } from './modules/drivers';
import { ReportsModule } from './modules/reports';
import { TripsModule } from './modules/trips';
import { VehiclesModule } from './modules/vehicles';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig, jwtConfig, otpConfig],
      envFilePath: ['.env'],
    }),
    CommonModule,
    PrismaModule,
    AuditLogsModule,
    AuthModule,
    NotificationsModule,
    ClientsModule,
    ContractsModule,
    DashboardModule,
    DriversModule,
    ReportsModule,
    TripsModule,
    VehiclesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: RateLimiterGuard },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
