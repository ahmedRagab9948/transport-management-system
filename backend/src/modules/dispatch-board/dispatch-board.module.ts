import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { TripsModule } from '../trips';
import { DispatchBoardController } from './dispatch-board.controller';
import { DispatchBoardService } from './dispatch-board.service';

@Module({
  imports: [CommonModule, PrismaModule, TripsModule],
  controllers: [DispatchBoardController],
  providers: [DispatchBoardService],
})
export class DispatchBoardModule {}
