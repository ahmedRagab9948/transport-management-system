import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RecordStatus } from '@prisma/client';
import { AuditService } from '../../../common/services/audit.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSectorDto } from '../dto/create-sector.dto';
import { QuerySectorsDto } from '../dto/query-sectors.dto';
import { UpdateSectorDto } from '../dto/update-sector.dto';
import { SectorStatusDto } from '../dto/sector-status.dto';
import { SECTOR_ERRORS } from '../constants/sector-errors';

const SECTOR_ENTITY_TYPE = 'Sector';

@Injectable()
export class SectorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateSectorDto, userId: string) {
    const existingName = await this.prisma.sector.findUnique({ where: { name: dto.name } });
    if (existingName) throw new ConflictException(SECTOR_ERRORS.NAME_EXISTS);

    const existingCode = await this.prisma.sector.findUnique({ where: { code: dto.code } });
    if (existingCode) throw new ConflictException(SECTOR_ERRORS.CODE_EXISTS);

    const sector = await this.prisma.sector.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        subSectors: {
          create: { name: dto.name, code: `${dto.code}-DEF` },
        },
      },
      include: { subSectors: true },
    });

    await this.log('SECTOR_CREATED', userId, sector.id, undefined, { name: dto.name, code: dto.code });

    return sector;
  }

  async findAll(query: QuerySectorsDto) {
    const page = parseInt(query.page ?? '1', 10);
    const limit = Math.min(parseInt(query.limit ?? '20', 10), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.SectorWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.sector.findMany({
        where,
        skip,
        take: limit,
        include: {
          subSectors: {
            where: { status: RecordStatus.ACTIVE },
            orderBy: { name: 'asc' },
          },
          _count: {
            select: {
              subSectors: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.sector.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const sector = await this.prisma.sector.findUnique({
      where: { id },
      include: {
        subSectors: { orderBy: { name: 'asc' } },
        _count: {
          select: { subSectors: true },
        },
      },
    });

    if (!sector) throw new NotFoundException(SECTOR_ERRORS.NOT_FOUND);
    return sector;
  }

  async update(id: string, dto: UpdateSectorDto, userId: string) {
    const sector = await this.prisma.sector.findUnique({ where: { id } });
    if (!sector) throw new NotFoundException(SECTOR_ERRORS.NOT_FOUND);

    if (dto.name && dto.name !== sector.name) {
      const existing = await this.prisma.sector.findUnique({ where: { name: dto.name } });
      if (existing) throw new ConflictException(SECTOR_ERRORS.NAME_EXISTS);
    }

    if (dto.code && dto.code !== sector.code) {
      const existing = await this.prisma.sector.findUnique({ where: { code: dto.code } });
      if (existing) throw new ConflictException(SECTOR_ERRORS.CODE_EXISTS);
    }

    const updated = await this.prisma.sector.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
      },
    });

    await this.log('SECTOR_UPDATED', userId, id, { name: sector.name, code: sector.code }, { name: updated.name, code: updated.code });

    return updated;
  }

  async updateStatus(id: string, dto: SectorStatusDto, userId: string) {
    const sector = await this.prisma.sector.findUnique({
      where: { id },
      include: {
        subSectors: {
          where: { status: RecordStatus.ACTIVE },
        },
      },
    });
    if (!sector) throw new NotFoundException(SECTOR_ERRORS.NOT_FOUND);

    if (dto.status === RecordStatus.INACTIVE) {
      const hasActiveAssignments = await this.checkActiveAssignments(id);
      if (hasActiveAssignments) {
        throw new BadRequestException(SECTOR_ERRORS.HAS_ACTIVE_ASSIGNMENTS);
      }
    }

    const updated = await this.prisma.sector.update({
      where: { id },
      data: { status: dto.status },
    });

    const action = dto.status === RecordStatus.ACTIVE ? 'SECTOR_ACTIVATED' : 'SECTOR_DEACTIVATED';
    await this.log(action, userId, id, { status: sector.status }, { status: dto.status });

    return updated;
  }

  private async checkActiveAssignments(sectorId: string): Promise<boolean> {
    const count = await this.prisma.vehicleAssignment.count({
      where: {
        unassignedAt: null,
        subSector: { sectorId },
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
      entityType: SECTOR_ENTITY_TYPE,
      entityId,
      oldValues: oldValues as Prisma.InputJsonValue | undefined,
      newValues: newValues as Prisma.InputJsonValue | undefined,
    });
  }
}
