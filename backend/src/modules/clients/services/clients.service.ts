import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientStatus, Prisma } from '@prisma/client';
import { AuditService } from '../../../common/services/audit.service';
import { toCsv } from '../../../common/utils/csv';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { CreateClientDto } from '../dto/create-client.dto';
import { QueryClientsDto } from '../dto/query-clients.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import {
  CLIENT_ENTITY_TYPE,
  ClientAuditAction,
} from '../enums/client-audit-action.enum';
import { UpdateClientStatusDto } from '../dto/update-client-status.dto';

const CLIENT_INCLUDE = {} as const;

type ClientWithRelations = Prisma.ClientGetPayload<{
  include: typeof CLIENT_INCLUDE;
}>;

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async updateStatus(
    id: string,
    dto: UpdateClientStatusDto,
    user: AuthenticatedUser,
  ): Promise<ClientWithRelations> {
    const existing = await this.findOne(id);
    const oldStatus = existing.status;

    const updated = await this.prisma.client.update({
      where: { id },
      data: { status: dto.status },
    });

    await this.log(ClientAuditAction.STATUS_CHANGE, user.id, id, {
      oldValues: { status: oldStatus },
      newValues: { status: dto.status },
      notes: dto.notes,
    });

    return updated;
  }

  async create(
    dto: CreateClientDto,
    user: AuthenticatedUser,
  ): Promise<ClientWithRelations> {
    const client = await this.prisma.client.create({
      data: {
        companyName: dto.companyName.trim(),
        contactPerson: dto.contactPerson.trim(),
        email: dto.email?.trim(),
        phone: dto.phone?.trim(),
        address: dto.address?.trim(),
        taxNumber: dto.taxNumber?.trim(),
        notes: dto.notes?.trim(),
        status: dto.status ?? ClientStatus.ACTIVE,
      },
      include: CLIENT_INCLUDE,
    });

    await this.log(ClientAuditAction.CREATE, user.id, client.id, {
      companyName: client.companyName,
      contactPerson: client.contactPerson,
      email: client.email,
      status: client.status,
    });

    return client;
  }

  async findAll(query: QueryClientsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.client.count({ where }),
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

  async findOne(id: string): Promise<ClientWithRelations> {
    const client = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(
    id: string,
    dto: UpdateClientDto,
    user: AuthenticatedUser,
  ): Promise<ClientWithRelations> {
    const existing = await this.findOne(id);

    try {
      const updated = await this.prisma.client.update({
        where: { id },
        data: {
          companyName: dto.companyName?.trim(),
          contactPerson: dto.contactPerson?.trim(),
          email: dto.email?.trim(),
          phone: dto.phone?.trim(),
          address: dto.address?.trim(),
          taxNumber: dto.taxNumber?.trim(),
          notes: dto.notes?.trim(),
          status: dto.status,
        },
      });

      await this.log(ClientAuditAction.UPDATE, user.id, id, {
        oldValues: this.toAuditSnapshot(existing),
        newValues: this.toAuditSnapshot(updated),
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  async remove(
    id: string,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    if (user.roleName !== 'admin') {
      throw new ForbiddenException('Only admins can delete clients');
    }

    const existing = await this.findOne(id);
    const deletedAt = new Date();

    await this.prisma.client.update({
      where: { id },
      data: { deletedAt },
    });

    await this.log(ClientAuditAction.DELETE, user.id, id, {
      oldValues: this.toAuditSnapshot(existing),
      deletedAt,
    });

    return { message: 'Client deleted successfully' };
  }

  private buildWhere(query: QueryClientsDto): Prisma.ClientWhereInput {
    const where: Prisma.ClientWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { taxNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async log(
    action: ClientAuditAction,
    userId: string,
    entityId: string,
    values?: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.auditService.log({
      userId,
      action,
      entityType: CLIENT_ENTITY_TYPE,
      entityId,
      newValues: values,
    });
  }

  async exportCsv(): Promise<string> {
    const clients = await this.prisma.client.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const rows = clients.map((c) => ({
      companyName: c.companyName,
      contactPerson: c.contactPerson,
      email: c.email ?? '',
      phone: c.phone ?? '',
      address: c.address ?? '',
      taxNumber: c.taxNumber ?? '',
      status: c.status,
      notes: c.notes ?? '',
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return toCsv(rows);
  }

  private toAuditSnapshot(
    client: ClientWithRelations,
  ): Prisma.InputJsonObject {
    return {
      id: client.id,
      companyName: client.companyName,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      address: client.address,
      taxNumber: client.taxNumber,
      status: client.status,
    };
  }
}
