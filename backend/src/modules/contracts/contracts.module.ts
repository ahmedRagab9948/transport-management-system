import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { ContractsController } from './controllers/contracts.controller';
import { ContractsService } from './services/contracts.service';

@Module({
  imports: [CommonModule, PrismaModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
