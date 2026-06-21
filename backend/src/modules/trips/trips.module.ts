import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { TripsController } from './controllers/trips.controller';
import { TripsService } from './services/trips.service';

@Module({
  imports: [CommonModule, PrismaModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
