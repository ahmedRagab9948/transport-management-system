import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContractStatus, ContractType, NotificationType, Prisma } from '@prisma/client';
import { AuditService } from '../../../common/services/audit.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { toCsv } from '../../../common/utils/csv';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { NOTIFICATION_EVENTS } from '../../notifications/events/notification-events';
import type { NotificationEvent } from '../../notifications/events/notification-events';
import { CreateContractDto } from '../dto/create-contract.dto';
import { QueryContractsDto } from '../dto/query-contracts.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { UpdateContractStatusDto } from '../dto/update-contract-status.dto';
import {
  CONTRACT_ENTITY_TYPE,
  ContractAuditAction,
} from '../enums/contract-audit-action.enum';

const CONTRACT_INCLUDE = {
  client: {
    select: {
      id: true,
      companyName: true,
    },
  },
  assignedVehicle: {
    select: {
      id: true,
      vehicleCode: true,
    },
  },
  assignedDriver: {
    select: {
      id: true,
      fullName: true,
      driverCode: true,
    },
  },
} as const;

type ContractWithRelations = Prisma.ContractGetPayload<{
  include: typeof CONTRACT_INCLUDE;
}>;

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updateStatus(
    id: string,
    dto: UpdateContractStatusDto,
    user: AuthenticatedUser,
  ): Promise<ContractWithRelations> {
    const existing = await this.findOne(id);
    const oldStatus = existing.status;

    if (dto.status === 'ACTIVE') {
      this.assertActiveContractValid({
        price: existing.price ? Number(existing.price) : null,
        startDate: existing.startDate,
        endDate: existing.endDate,
        clientId: existing.clientId,
        contractType: existing.contractType,
        assignedVehicleId: existing.assignedVehicleId,
      });
    }

    if ((oldStatus === 'EXPIRED' || oldStatus === 'TERMINATED') && dto.status === 'ACTIVE') {
      throw new BadRequestException(
        `Cannot reactivate a ${oldStatus.toLowerCase()} contract`,
      );
    }

    if (
      dto.status === 'ACTIVE' &&
      existing.contractType === ContractType.MONTHLY
    ) {
      if (existing.assignedVehicleId) {
        await this.assertVehicleNotAssignedToActiveMonthlyContract(existing.assignedVehicleId, id);
      }
      if (existing.assignedDriverId) {
        await this.assertDriverNotAssignedToActiveMonthlyContract(existing.assignedDriverId, id);
      }
    }

    const releaseVehicle = (dto.status === 'EXPIRED' || dto.status === 'TERMINATED')
      && existing.assignedVehicleId;
    const releaseDriver = (dto.status === 'EXPIRED' || dto.status === 'TERMINATED')
      && existing.assignedDriverId;

    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        status: dto.status,
        ...(releaseVehicle ? { assignedVehicleId: null } : {}),
        ...(releaseDriver ? { assignedDriverId: null } : {}),
      },
      include: CONTRACT_INCLUDE,
    });

    await this.log(ContractAuditAction.STATUS_CHANGE, user.id, id, {
      oldValues: { status: oldStatus },
      newValues: { status: dto.status },
      notes: dto.notes,
    });

    return updated;
  }

  async create(
    dto: CreateContractDto,
    user: AuthenticatedUser,
  ): Promise<ContractWithRelations> {
    await this.assertClientExists(dto.clientId);

    const targetStatus = dto.status ?? 'DRAFT';
    const resolvedContractType = dto.contractType ?? ContractType.PER_TRIP;

    if (targetStatus === 'ACTIVE') {
      this.assertActiveContractValid({
        price: dto.price,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        clientId: dto.clientId,
        contractType: resolvedContractType,
        assignedVehicleId: dto.assignedVehicleId,
      });
    }

    if (dto.assignedVehicleId) {
      await this.assertVehicleExists(dto.assignedVehicleId);
    }

    if (dto.assignedDriverId) {
      await this.assertDriverExists(dto.assignedDriverId);
      await this.assertDriverActive(dto.assignedDriverId);
    }

    if (
      resolvedContractType === ContractType.MONTHLY &&
      targetStatus === 'ACTIVE'
    ) {
      if (dto.assignedVehicleId) {
        await this.assertVehicleNotAssignedToActiveMonthlyContract(dto.assignedVehicleId);
      }
      if (dto.assignedDriverId) {
        await this.assertDriverNotAssignedToActiveMonthlyContract(dto.assignedDriverId);
      }
    }

    try {
      const contract = await this.prisma.contract.create({
        data: {
          contractNumber: dto.contractNumber.trim(),
          clientId: dto.clientId,
          title: dto.title.trim(),
          description: dto.description?.trim(),
          fromLocation: dto.fromLocation?.trim(),
          toLocation: dto.toLocation?.trim(),
          price: dto.price,
          currency: dto.currency?.trim() ?? 'EGP',
          contractType: resolvedContractType,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
          status: dto.status ?? ContractStatus.DRAFT,
          assignedVehicleId: dto.assignedVehicleId ?? null,
          assignedDriverId: dto.assignedDriverId ?? null,
          notes: dto.notes?.trim(),
        },
        include: CONTRACT_INCLUDE,
      });

      await this.log(ContractAuditAction.CREATE, user.id, contract.id, {
        contractNumber: contract.contractNumber,
        title: contract.title,
        clientId: contract.clientId,
        status: contract.status,
      });

      return contract;
    } catch (error) {
      this.handleKnownPrismaError(error);
      throw error;
    }
  }

  async findAll(query: QueryContractsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.contract.findMany({
        where,
        include: CONTRACT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contract.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ContractWithRelations> {
    const contract = await this.prisma.contract.findFirst({
      where: { id, deletedAt: null },
      include: CONTRACT_INCLUDE,
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  async update(
    id: string,
    dto: UpdateContractDto,
    user: AuthenticatedUser,
  ): Promise<ContractWithRelations> {
    const existing = await this.findOne(id);

    if (dto.clientId) {
      await this.assertClientExists(dto.clientId);
    }

    const resolvedStatus = dto.status ?? existing.status;
    const resolvedContractType = dto.contractType ?? existing.contractType;
    const resolvedVehicleId = dto.assignedVehicleId !== undefined
      ? dto.assignedVehicleId
      : existing.assignedVehicleId;
    const resolvedDriverId = dto.assignedDriverId !== undefined
      ? dto.assignedDriverId
      : existing.assignedDriverId;

    if (resolvedStatus === 'ACTIVE') {
      this.assertActiveContractValid({
        price: dto.price !== undefined ? dto.price : (existing.price ? Number(existing.price) : null),
        startDate: dto.startDate ? new Date(dto.startDate) : existing.startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : existing.endDate,
        clientId: dto.clientId ?? existing.clientId,
        contractType: resolvedContractType,
        assignedVehicleId: resolvedVehicleId,
      });
    }

    if ((existing.status === 'EXPIRED' || existing.status === 'TERMINATED') && resolvedStatus === 'ACTIVE') {
      throw new BadRequestException(
        `Cannot reactivate a ${existing.status.toLowerCase()} contract`,
      );
    }

    if (dto.assignedVehicleId) {
      await this.assertVehicleExists(dto.assignedVehicleId);
    }

    if (dto.assignedDriverId !== undefined) {
      if (dto.assignedDriverId === null) {
        // explicitly clearing — allow
      } else {
        await this.assertDriverExists(dto.assignedDriverId);
        await this.assertDriverActive(dto.assignedDriverId);
      }
    }

    if (
      resolvedContractType === ContractType.MONTHLY &&
      resolvedStatus === 'ACTIVE'
    ) {
      if (resolvedVehicleId) {
        await this.assertVehicleNotAssignedToActiveMonthlyContract(resolvedVehicleId, id);
      }
      if (resolvedDriverId) {
        await this.assertDriverNotAssignedToActiveMonthlyContract(resolvedDriverId, id);
      }
    }

    const releaseVehicle = dto.status
      && (dto.status === 'EXPIRED' || dto.status === 'TERMINATED')
      && existing.assignedVehicleId;
    const releaseDriver = dto.status
      && (dto.status === 'EXPIRED' || dto.status === 'TERMINATED')
      && existing.assignedDriverId;

    try {
      const updated = await this.prisma.contract.update({
        where: { id },
        data: {
          contractNumber: dto.contractNumber?.trim(),
          clientId: dto.clientId,
          title: dto.title?.trim(),
          description: dto.description?.trim(),
          fromLocation: dto.fromLocation?.trim(),
          toLocation: dto.toLocation?.trim(),
          price: dto.price,
          currency: dto.currency?.trim(),
          contractType: dto.contractType,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
          status: dto.status,
          assignedVehicleId: releaseVehicle ? null : dto.assignedVehicleId,
          assignedDriverId: releaseDriver ? null : dto.assignedDriverId,
          notes: dto.notes?.trim(),
        },
        include: CONTRACT_INCLUDE,
      });

      await this.log(ContractAuditAction.UPDATE, user.id, id, {
        oldValues: this.toAuditSnapshot(existing),
        newValues: this.toAuditSnapshot(updated),
      });

      return updated;
    } catch (error) {
      this.handleKnownPrismaError(error);
      throw error;
    }
  }

  async remove(
    id: string,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const existing = await this.findOne(id);
    const deletedAt = new Date();

    await this.prisma.contract.update({
      where: { id },
      data: { deletedAt },
    });

    await this.log(ContractAuditAction.DELETE, user.id, id, {
      oldValues: this.toAuditSnapshot(existing),
      deletedAt,
    });

    return { message: 'Contract deleted successfully' };
  }

  private assertActiveContractValid(data: {
    price?: number | null;
    startDate?: Date | null;
    endDate?: Date | null;
    clientId: string;
    contractType: ContractType;
    assignedVehicleId?: string | null;
  }): void {
    const errors: string[] = [];

    if (!data.clientId) {
      errors.push('Client is required for ACTIVE contracts');
    }
    if (!data.startDate) {
      errors.push('Start date is required for ACTIVE contracts');
    }
    if (!data.endDate) {
      errors.push('End date is required for ACTIVE contracts');
    }
    if (data.price == null || Number(data.price) <= 0) {
      errors.push('Price is required and must be positive for ACTIVE contracts');
    }
    if (
      data.contractType === ContractType.MONTHLY &&
      !data.assignedVehicleId
    ) {
      errors.push('Assigned vehicle is required for MONTHLY ACTIVE contracts');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }

    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      throw new BadRequestException('End date must be after start date for ACTIVE contracts');
    }
  }

  private async assertVehicleExists(vehicleId: string): Promise<void> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, deletedAt: null },
    });

    if (!vehicle) {
      throw new BadRequestException('Vehicle not found');
    }
  }

  private async assertVehicleNotAssignedToActiveMonthlyContract(
    vehicleId: string,
    excludeContractId?: string,
  ): Promise<void> {
    const conflicting = await this.prisma.contract.findFirst({
      where: {
        assignedVehicleId: vehicleId,
        status: 'ACTIVE',
        contractType: 'MONTHLY',
        deletedAt: null,
        ...(excludeContractId ? { id: { not: excludeContractId } } : {}),
      },
    });

    if (conflicting) {
      throw new BadRequestException(
        'Vehicle is already assigned to another active monthly contract',
      );
    }
  }

  private async assertDriverNotAssignedToActiveMonthlyContract(
    driverId: string,
    excludeContractId?: string,
  ): Promise<void> {
    const conflicting = await this.prisma.contract.findFirst({
      where: {
        assignedDriverId: driverId,
        status: 'ACTIVE',
        contractType: 'MONTHLY',
        deletedAt: null,
        ...(excludeContractId ? { id: { not: excludeContractId } } : {}),
      },
    });

    if (conflicting) {
      throw new BadRequestException(
        'Driver is already assigned to another active monthly contract',
      );
    }
  }

  private async assertClientExists(clientId: string): Promise<void> {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, deletedAt: null },
    });

    if (!client) {
      throw new BadRequestException('Client not found');
    }
  }

  private async assertDriverExists(driverId: string): Promise<void> {
    const driver = await this.prisma.driver.findFirst({
      where: { id: driverId, deletedAt: null },
    });

    if (!driver) {
      throw new BadRequestException('Driver not found');
    }
  }

  private async assertDriverActive(driverId: string): Promise<void> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: { status: true },
    });

    if (driver && driver.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Driver status must be ACTIVE to be assigned to a contract (current: ${driver.status})`,
      );
    }
  }

  private buildWhere(query: QueryContractsDto): Prisma.ContractWhereInput {
    const where: Prisma.ContractWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.clientId) {
      where.clientId = query.clientId;
    }

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { contractNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { fromLocation: { contains: search, mode: 'insensitive' } },
        { toLocation: { contains: search, mode: 'insensitive' } },
        {
          client: {
            companyName: { contains: search, mode: 'insensitive' } },
        },
      ];
    }

    return where;
  }

  private async log(
    action: ContractAuditAction,
    userId: string,
    entityId: string,
    values?: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.auditService.log({
      userId,
      action,
      entityType: CONTRACT_ENTITY_TYPE,
      entityId,
      newValues: values,
    });
  }

  private toAuditSnapshot(
    contract: ContractWithRelations,
  ): Prisma.InputJsonObject {
    return {
      id: contract.id,
      contractNumber: contract.contractNumber,
      title: contract.title,
      clientId: contract.clientId,
      fromLocation: contract.fromLocation,
      toLocation: contract.toLocation,
      price: contract.price,
      currency: contract.currency,
      contractType: contract.contractType,
      status: contract.status,
      assignedVehicleId: contract.assignedVehicleId,
      assignedDriverId: contract.assignedDriverId,
    };
  }

  async exportCsv(): Promise<string> {
    const contracts = await this.prisma.contract.findMany({
      where: { deletedAt: null },
      include: CONTRACT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    const rows = contracts.map((c) => ({
      contractNumber: c.contractNumber,
      title: c.title,
      description: c.description ?? '',
      fromLocation: c.fromLocation ?? '',
      toLocation: c.toLocation ?? '',
      startDate: c.startDate?.toISOString() ?? '',
      endDate: c.endDate?.toISOString() ?? '',
      price: c.price?.toString() ?? '',
      currency: c.currency,
      status: c.status,
      notes: c.notes ?? '',
      assignedVehicleId: c.assignedVehicleId ?? '',
      assignedDriverId: c.assignedDriverId ?? '',
      clientName: c.client.companyName,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return toCsv(rows);
  }

  private handleKnownPrismaError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException('Contract number already exists');
    }
  }
}
