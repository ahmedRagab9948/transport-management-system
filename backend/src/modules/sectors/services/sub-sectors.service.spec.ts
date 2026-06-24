import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RecordStatus } from '@prisma/client';
import { AuditService } from '../../../common/services/audit.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { SubSectorsService } from './sub-sectors.service';

describe('SubSectorsService', () => {
  let service: SubSectorsService;
  let prisma: any;
  let auditService: jest.Mocked<AuditService>;

  const mockPrisma = {
    sector: {
      findUnique: jest.fn(),
    },
    subSector: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    vehicleAssignment: {
      count: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((fn: (tx: any) => any) => fn(mockPrisma)),
  };

  const mockAuditService = {
    log: jest.fn(),
  } as unknown as jest.Mocked<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubSectorsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<SubSectorsService>(SubSectorsService);
    prisma = module.get(PrismaService);
    auditService = module.get(AuditService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = { name: 'North Zone', code: 'NZ', description: 'North zone' };

    it('should create a sub-sector under a sector', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue({ id: 'sector-1', name: 'Test' });
      mockPrisma.subSector.findUnique.mockResolvedValue(null);
      mockPrisma.subSector.findUnique.mockResolvedValue(null);

      const created = { id: 'sub-1', sectorId: 'sector-1', ...dto, status: 'ACTIVE' };
      mockPrisma.subSector.create.mockResolvedValue(created);

      const result = await service.create('sector-1', dto, 'user-1');

      expect(prisma.subSector.create).toHaveBeenCalledWith({
        data: { sectorId: 'sector-1', name: 'North Zone', code: 'NZ', description: 'North zone' },
        include: { sector: true },
      });
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SUB_SECTOR_CREATED' }),
      );
      expect(result).toEqual(created);
    });

    it('should throw NotFoundException when sector does not exist', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue(null);

      await expect(service.create('missing', dto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate name', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue({ id: 'sector-1' });
      mockPrisma.subSector.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create('sector-1', dto, 'user-1')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException on duplicate code', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue({ id: 'sector-1' });
      mockPrisma.subSector.findUnique.mockResolvedValueOnce(null);
      mockPrisma.subSector.findUnique.mockResolvedValueOnce({ id: 'existing' });

      await expect(service.create('sector-1', dto, 'user-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return sub-sectors for a sector', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue({ id: 'sector-1' });
      const subs = [{ id: 'sub-1', name: 'North' }, { id: 'sub-2', name: 'South' }];
      mockPrisma.subSector.findMany.mockResolvedValue(subs);

      const result = await service.findAll('sector-1');

      expect(result).toEqual(subs);
      expect(prisma.subSector.findMany).toHaveBeenCalledWith({
        where: { sectorId: 'sector-1' },
        orderBy: { name: 'asc' },
      });
    });

    it('should throw NotFoundException when sector missing', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue(null);

      await expect(service.findAll('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return sub-sector with sector', async () => {
      const sub = { id: 'sub-1', name: 'North', sector: { id: 'sector-1', name: 'Test' } };
      mockPrisma.subSector.findUnique.mockResolvedValue(sub);

      const result = await service.findOne('sub-1');

      expect(result).toEqual(sub);
    });

    it('should throw NotFoundException when missing', async () => {
      mockPrisma.subSector.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update sub-sector fields', async () => {
      const existing = { id: 'sub-1', sectorId: 'sector-1', name: 'Old', code: 'OLD', description: null, status: RecordStatus.ACTIVE };
      mockPrisma.subSector.findUnique
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(null);
      const updated = { ...existing, name: 'New Name' };
      mockPrisma.subSector.update.mockResolvedValue(updated);

      const result = await service.update('sub-1', { name: 'New Name' }, 'user-1');

      expect(result.name).toBe('New Name');
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SUB_SECTOR_UPDATED' }),
      );
    });

    it('should throw ConflictException on duplicate name within same sector', async () => {
      const existing = { id: 'sub-1', sectorId: 'sector-1', name: 'Old', code: 'OLD', status: RecordStatus.ACTIVE };
      mockPrisma.subSector.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.subSector.findUnique.mockResolvedValueOnce({ id: 'other' });

      await expect(service.update('sub-1', { name: 'Duplicate' }, 'user-1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when missing', async () => {
      mockPrisma.subSector.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'X' }, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should activate a sub-sector', async () => {
      const sub = { id: 'sub-1', sector: { id: 'sector-1' }, name: 'North', status: RecordStatus.INACTIVE };
      mockPrisma.subSector.findUnique.mockResolvedValue(sub);
      const updated = { ...sub, status: RecordStatus.ACTIVE };
      mockPrisma.subSector.update.mockResolvedValue(updated);

      const result = await service.updateStatus('sub-1', { status: RecordStatus.ACTIVE }, 'user-1');

      expect(result.status).toBe(RecordStatus.ACTIVE);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SUB_SECTOR_ACTIVATED' }),
      );
    });

    it('should deactivate a sub-sector with no active assignments when other active exists', async () => {
      const sub = { id: 'sub-1', sector: { id: 'sector-1' }, name: 'North', status: RecordStatus.ACTIVE };
      mockPrisma.subSector.findUnique.mockResolvedValue(sub);
      mockPrisma.vehicleAssignment.count.mockResolvedValue(0);
      mockPrisma.subSector.count.mockResolvedValue(1);
      const updated = { ...sub, status: RecordStatus.INACTIVE };
      mockPrisma.subSector.update.mockResolvedValue(updated);

      const result = await service.updateStatus('sub-1', { status: RecordStatus.INACTIVE }, 'user-1');

      expect(result.status).toBe(RecordStatus.INACTIVE);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SUB_SECTOR_DEACTIVATED' }),
      );
    });

    it('should throw BadRequestException when sub-sector has active vehicle assignments', async () => {
      const sub = { id: 'sub-1', sector: { id: 'sector-1' }, name: 'North', status: RecordStatus.ACTIVE };
      mockPrisma.subSector.findUnique.mockResolvedValue(sub);
      mockPrisma.vehicleAssignment.count.mockResolvedValue(1);

      await expect(service.updateStatus('sub-1', { status: RecordStatus.INACTIVE }, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when it is the last active sub-sector', async () => {
      const sub = { id: 'sub-1', sector: { id: 'sector-1' }, name: 'North', status: RecordStatus.ACTIVE };
      mockPrisma.subSector.findUnique.mockResolvedValue(sub);
      mockPrisma.vehicleAssignment.count.mockResolvedValue(0);
      mockPrisma.subSector.count.mockResolvedValue(0);

      await expect(service.updateStatus('sub-1', { status: RecordStatus.INACTIVE }, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when sub-sector missing', async () => {
      mockPrisma.subSector.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('missing', { status: RecordStatus.ACTIVE }, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
