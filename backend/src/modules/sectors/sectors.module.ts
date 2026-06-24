import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubSectorsController } from './controllers/sub-sectors.controller';
import { SectorsController } from './controllers/sectors.controller';
import { SectorsService } from './services/sectors.service';
import { SubSectorsService } from './services/sub-sectors.service';

@Module({
  imports: [CommonModule, PrismaModule],
  controllers: [SectorsController, SubSectorsController],
  providers: [SectorsService, SubSectorsService],
  exports: [SectorsService, SubSectorsService],
})
export class SectorsModule {}
