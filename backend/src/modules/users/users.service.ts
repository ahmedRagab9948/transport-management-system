import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { AuditService } from '../../common/services/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { RefreshTokenService } from '../auth/services/refresh-token.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_ENTITY_TYPE, UsersAuditAction } from './enums/users-audit-action.enum';

const USER_RESPONSE_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  isActive: true,
  otpEnabled: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const SORTABLE_FIELDS = ['fullName', 'email', 'isActive', 'createdAt', 'updatedAt', 'lastLoginAt'] as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async findAll(query: QueryUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    const orderField = SORTABLE_FIELDS.includes(query.sortBy as any) ? query.sortBy! : 'createdAt';
    const orderBy = { [orderField]: query.sortOrder ?? 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: USER_RESPONSE_SELECT,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
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

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: USER_RESPONSE_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(dto: CreateUserDto, user: AuthenticatedUser) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const created = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        email,
        passwordHash,
        phone: dto.phone?.trim() ?? null,
        roleId: dto.roleId,
        isActive: dto.isActive ?? true,
        otpEnabled: dto.otpEnabled ?? true,
      },
      select: USER_RESPONSE_SELECT,
    });

    await this.log(UsersAuditAction.CREATE, user.id, created.id, {
      email: created.email,
      fullName: created.fullName,
      roleId: dto.roleId,
    });

    return created;
  }

  async update(id: string, dto: UpdateUserDto, user: AuthenticatedUser) {
    const existing = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (dto.email) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      if (normalizedEmail !== existing.email) {
        const duplicate = await this.prisma.user.findFirst({
          where: { email: normalizedEmail, deletedAt: null, id: { not: id } },
        });
        if (duplicate) {
          throw new ConflictException('Email already in use');
        }
      }
    }

    const updateData: any = {};
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName.trim();
    if (dto.email !== undefined) updateData.email = dto.email.trim().toLowerCase();
    if (dto.phone !== undefined) updateData.phone = dto.phone.trim();
    if (dto.roleId !== undefined) updateData.roleId = dto.roleId;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.otpEnabled !== undefined) updateData.otpEnabled = dto.otpEnabled;

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_RESPONSE_SELECT,
    });

    await this.log(UsersAuditAction.UPDATE, user.id, id, {
      oldValues: {
        fullName: existing.fullName,
        email: existing.email,
        phone: existing.phone,
        isActive: existing.isActive,
        otpEnabled: existing.otpEnabled,
      },
      newValues: {
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        isActive: updated.isActive,
        otpEnabled: updated.otpEnabled,
      },
    });

    return updated;
  }

  async remove(id: string, user: AuthenticatedUser) {
    if (id === user.id) {
      throw new BadRequestException('Cannot deactivate yourself');
    }

    const existing = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await this.log(UsersAuditAction.DEACTIVATE, user.id, id, {
      oldValues: { isActive: existing.isActive },
    });

    return { message: 'User deactivated successfully' };
  }

  async activate(id: string, user: AuthenticatedUser) {
    const existing = await this.prisma.user.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });

    await this.log(UsersAuditAction.REACTIVATE, user.id, id);

    return { message: 'User activated successfully' };
  }

  async resetPassword(id: string, user: AuthenticatedUser) {
    if (id === user.id) {
      throw new BadRequestException('Cannot reset your own password');
    }

    const existing = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    await this.refreshTokenService.revokeAllForUser(id);

    await this.log(UsersAuditAction.RESET_PASSWORD, user.id, id);

    return { temporaryPassword };
  }

  async forceLogout(id: string, user: AuthenticatedUser) {
    const existing = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    await this.refreshTokenService.revokeAllForUser(id);

    await this.log(UsersAuditAction.FORCE_LOGOUT, user.id, id);

    return { message: 'User logged out from all devices' };
  }

  async getRoles(): Promise<Array<{ id: string; name: string; description: string | null }>> {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true },
    });
  }

  async getSummary() {
    const [total, active, inactive] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: false } }),
    ]);

    return { total, active, inactive };
  }

  private buildWhere(query: QueryUsersDto) {
    const where: any = { deletedAt: null };

    if (query.roleId) {
      where.roleId = query.roleId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async log(
    action: UsersAuditAction,
    userId: string,
    entityId: string,
    values?: Record<string, unknown>,
  ): Promise<void> {
    await this.auditService.log({
      userId,
      action,
      entityType: USER_ENTITY_TYPE,
      entityId,
      newValues: values as any,
    });
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
}
