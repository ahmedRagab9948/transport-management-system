import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubSectorsController } from './controllers/sub-sectors.controller';
import { SectorsController } from './controllers/sectors.controller';
import { VehicleAssignmentsController } from './controllers/vehicle-assignments.controller';
import { SectorsService } from './services/sectors.service';
import { SubSectorsService } from './services/sub-sectors.service';
import { VehicleAssignmentsService } from './services/vehicle-assignments.service';

@Module({
  imports: [CommonModule, PrismaModule],
  controllers: [SectorsController, SubSectorsController, VehicleAssignmentsController],
  providers: [SectorsService, SubSectorsService, VehicleAssignmentsService],
  exports: [SectorsService, SubSectorsService, VehicleAssignmentsService],
})
export class SectorsModule {}
