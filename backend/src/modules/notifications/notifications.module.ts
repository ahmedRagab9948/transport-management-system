import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import {
  TripNotificationListener,
  VehicleNotificationListener,
  DriverNotificationListener,
  ContractNotificationListener,
} from './listeners';

@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      verboseMemoryLeak: true,
      global: true,
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    TripNotificationListener,
    VehicleNotificationListener,
    DriverNotificationListener,
    ContractNotificationListener,
  ],
  exports: [NotificationsService, EventEmitterModule],
})
export class NotificationsModule {}
