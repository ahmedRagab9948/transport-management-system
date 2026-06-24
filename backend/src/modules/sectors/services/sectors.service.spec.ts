import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RecordStatus } from '@prisma/client';
import { AuditService } from '../../../common/services/audit.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { SectorsService } from './sectors.service';

describe('SectorsService', () => {
  let service: SectorsService;
  let prisma: jest.Mocked<PrismaService>;
  let auditService: jest.Mocked<AuditService>;

  const mockPrisma = {
    sector: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    subSector: {
      count: jest.fn(),
    },
    vehicleAssignment: {
      count: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((fn: (tx: any) => any) => fn(mockPrisma)),
  } as unknown as jest.Mocked<PrismaService>;

  const mockAuditService = {
    log: jest.fn(),
  } as unknown as jest.Mocked<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectorsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<SectorsService>(SectorsService);
    prisma = module.get(PrismaService);
    auditService = module.get(AuditService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = { name: 'Test Sector', code: 'TS', description: 'A test' };

    it('should create a sector with a default sub-sector', async () => {
      mockPrisma.sector.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const created = { id: 'sector-1', ...dto, status: 'ACTIVE', subSectors: [{ id: 'sub-1', name: 'Test Sector', code: 'TS-DEF' }] };
      mockPrisma.sector.create.mockResolvedValue(created);

      const result = await service.create(dto, 'user-1');

      expect(prisma.sector.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Sector',
          code: 'TS',
          subSectors: {
            create: { name: 'Test Sector', code: 'TS-DEF' },
          },
        }),
        include: { subSectors: true },
      });
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SECTOR_CREATED', entityId: 'sector-1', newValues: { name: 'Test Sector', code: 'TS' } }),
      );
      expect(result).toEqual(created);
    });

    it('should throw ConflictException when name already exists', async () => {
      mockPrisma.sector.findUnique.mockResolvedValueOnce({ id: 'existing' });

      await expect(service.create(dto, 'user-1')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when code already exists', async () => {
      mockPrisma.sector.findUnique.mockResolvedValueOnce(null);
      mockPrisma.sector.findUnique.mockResolvedValueOnce({ id: 'existing' });

      await expect(service.create(dto, 'user-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated sectors with filters', async () => {
      mockPrisma.sector.count.mockResolvedValue(1);
      mockPrisma.sector.findMany.mockResolvedValue([{ id: 'sector-1', name: 'Test' }]);

      const result = await service.findAll({ page: '1', limit: '20' });

      expect(result).toEqual({
        items: [{ id: 'sector-1', name: 'Test' }],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    });

    it('should filter by search query', async () => {
      mockPrisma.sector.count.mockResolvedValue(0);
      mockPrisma.sector.findMany.mockResolvedValue([]);
      await service.findAll({ search: 'Test', page: '1', limit: '20' });

      expect(prisma.sector.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: { contains: 'Test', mode: 'insensitive' } }),
            ]),
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrisma.sector.count.mockResolvedValue(0);
      mockPrisma.sector.findMany.mockResolvedValue([]);
      await service.findAll({ status: RecordStatus.ACTIVE, page: '1', limit: '20' });

      expect(prisma.sector.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: RecordStatus.ACTIVE }),
        }),
      );
    });

    it('should cap limit at 100', async () => {
      mockPrisma.sector.count.mockResolvedValue(0);
      mockPrisma.sector.findMany.mockResolvedValue([]);

      await service.findAll({ page: '1', limit: '500' });

      expect(prisma.sector.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return sector with sub-sectors', async () => {
      const sector = { id: 'sector-1', name: 'Test', subSectors: [] };
      mockPrisma.sector.findUnique.mockResolvedValue(sector);

      const result = await service.findOne('sector-1');

      expect(result).toEqual(sector);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update sector fields', async () => {
      const existing = { id: 'sector-1', name: 'Old', code: 'OLD', description: null, status: RecordStatus.ACTIVE };
      mockPrisma.sector.findUnique
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(null);
      const updated = { ...existing, name: 'New Name' };
      mockPrisma.sector.update.mockResolvedValue(updated);

      const result = await service.update('sector-1', { name: 'New Name' }, 'user-1');

      expect(result.name).toBe('New Name');
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SECTOR_UPDATED' }),
      );
    });

    it('should throw ConflictException on duplicate name', async () => {
      const existing = { id: 'sector-1', name: 'Old', code: 'OLD', description: null, status: RecordStatus.ACTIVE };
      mockPrisma.sector.findUnique
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce({ id: 'other' });

      await expect(service.update('sector-1', { name: 'Duplicate' }, 'user-1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when sector missing', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'X' }, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should activate a sector', async () => {
      const sector = { id: 'sector-1', name: 'Test', code: 'TS', status: RecordStatus.INACTIVE };
      mockPrisma.sector.findUnique.mockResolvedValue(sector);
      const updated = { ...sector, status: RecordStatus.ACTIVE };
      mockPrisma.sector.update.mockResolvedValue(updated);

      const result = await service.updateStatus('sector-1', { status: RecordStatus.ACTIVE }, 'user-1');

      expect(result.status).toBe(RecordStatus.ACTIVE);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SECTOR_ACTIVATED' }),
      );
    });

    it('should deactivate a sector with no active assignments', async () => {
      const sector = { id: 'sector-1', name: 'Test', code: 'TS', status: RecordStatus.ACTIVE };
      mockPrisma.sector.findUnique.mockResolvedValue(sector);
      mockPrisma.vehicleAssignment.count.mockResolvedValue(0);
      const updated = { ...sector, status: RecordStatus.INACTIVE };
      mockPrisma.sector.update.mockResolvedValue(updated);

      const result = await service.updateStatus('sector-1', { status: RecordStatus.INACTIVE }, 'user-1');

      expect(result.status).toBe(RecordStatus.INACTIVE);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SECTOR_DEACTIVATED' }),
      );
    });

    it('should throw BadRequestException when sector has active assignments', async () => {
      const sector = { id: 'sector-1', name: 'Test', code: 'TS', status: RecordStatus.ACTIVE };
      mockPrisma.sector.findUnique.mockResolvedValue(sector);
      mockPrisma.vehicleAssignment.count.mockResolvedValue(5);

      await expect(service.updateStatus('sector-1', { status: RecordStatus.INACTIVE }, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for missing sector', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('missing', { status: RecordStatus.ACTIVE }, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
