import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RecordStatus } from '@prisma/client';
import { AuditService } from '../../../common/services/audit.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSubSectorDto } from '../dto/create-sub-sector.dto';
import { UpdateSubSectorDto } from '../dto/update-sub-sector.dto';
import { SectorStatusDto } from '../dto/sector-status.dto';
import { SECTOR_ERRORS } from '../constants/sector-errors';

const SUB_SECTOR_ENTITY_TYPE = 'SubSector';

@Injectable()
export class SubSectorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(sectorId: string, dto: CreateSubSectorDto, userId: string) {
    const sector = await this.prisma.sector.findUnique({ where: { id: sectorId } });
    if (!sector) throw new NotFoundException(SECTOR_ERRORS.NOT_FOUND);

    const existingName = await this.prisma.subSector.findUnique({
      where: { sectorId_name: { sectorId, name: dto.name } },
    });
    if (existingName) throw new ConflictException(SECTOR_ERRORS.SUB_SECTOR_NAME_EXISTS);

    const existingCode = await this.prisma.subSector.findUnique({
      where: { sectorId_code: { sectorId, code: dto.code } },
    });
    if (existingCode) throw new ConflictException(SECTOR_ERRORS.SUB_SECTOR_CODE_EXISTS);

    const subSector = await this.prisma.subSector.create({
      data: {
        sectorId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
      },
      include: { sector: true },
    });

    await this.log('SUB_SECTOR_CREATED', userId, subSector.id, undefined, { name: dto.name, code: dto.code, sectorId });

    return subSector;
  }

  async findAll(sectorId: string) {
    const sector = await this.prisma.sector.findUnique({ where: { id: sectorId } });
    if (!sector) throw new NotFoundException(SECTOR_ERRORS.NOT_FOUND);

    return this.prisma.subSector.findMany({
      where: { sectorId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const subSector = await this.prisma.subSector.findUnique({
      where: { id },
      include: { sector: true },
    });

    if (!subSector) throw new NotFoundException(SECTOR_ERRORS.SUB_SECTOR_NOT_FOUND);
    return subSector;
  }

  async update(id: string, dto: UpdateSubSectorDto, userId: string) {
    const subSector = await this.prisma.subSector.findUnique({ where: { id } });
    if (!subSector) throw new NotFoundException(SECTOR_ERRORS.SUB_SECTOR_NOT_FOUND);

    if (dto.name && dto.name !== subSector.name) {
      const existing = await this.prisma.subSector.findUnique({
        where: { sectorId_name: { sectorId: subSector.sectorId, name: dto.name } },
      });
      if (existing) throw new ConflictException(SECTOR_ERRORS.SUB_SECTOR_NAME_EXISTS);
    }

    if (dto.code && dto.code !== subSector.code) {
      const existing = await this.prisma.subSector.findUnique({
        where: { sectorId_code: { sectorId: subSector.sectorId, code: dto.code } },
      });
      if (existing) throw new ConflictException(SECTOR_ERRORS.SUB_SECTOR_CODE_EXISTS);
    }

    const updated = await this.prisma.subSector.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
      },
    });

    await this.log('SUB_SECTOR_UPDATED', userId, id, { name: subSector.name, code: subSector.code }, { name: updated.name, code: updated.code });

    return updated;
  }

  async updateStatus(id: string, dto: SectorStatusDto, userId: string) {
    const subSector = await this.prisma.subSector.findUnique({
      where: { id },
      include: { sector: true },
    });
    if (!subSector) throw new NotFoundException(SECTOR_ERRORS.SUB_SECTOR_NOT_FOUND);

    if (dto.status === RecordStatus.INACTIVE) {
      const hasActiveAssignments = await this.checkActiveAssignments(id);
      if (hasActiveAssignments) {
        throw new BadRequestException(SECTOR_ERRORS.SUB_SECTOR_HAS_ASSIGNMENTS);
      }

      const activeCount = await this.prisma.subSector.count({
        where: {
          sectorId: subSector.sectorId,
          status: RecordStatus.ACTIVE,
          id: { not: id },
        },
      });

      if (activeCount === 0) {
        throw new BadRequestException(SECTOR_ERRORS.LAST_ACTIVE_SUB_SECTOR);
      }
    }

    const updated = await this.prisma.subSector.update({
      where: { id },
      data: { status: dto.status },
    });

    const action = dto.status === RecordStatus.ACTIVE ? 'SUB_SECTOR_ACTIVATED' : 'SUB_SECTOR_DEACTIVATED';
    await this.log(action, userId, id, { status: subSector.status }, { status: dto.status });

    return updated;
  }

  private async checkActiveAssignments(subSectorId: string): Promise<boolean> {
    const count = await this.prisma.vehicleAssignment.count({
      where: {
        subSectorId,
        unassignedAt: null,
      },
    });
    return count > 0;
  }

  private async log(
    action: string,
    userId: string,
    entityId: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
  ) {
    await this.auditService.log({
      userId,
      action,
      entityType: SUB_SECTOR_ENTITY_TYPE,
      entityId,
      oldValues: oldValues as Prisma.InputJsonValue | undefined,
      newValues: newValues as Prisma.InputJsonValue | undefined,
    });
  }
}
