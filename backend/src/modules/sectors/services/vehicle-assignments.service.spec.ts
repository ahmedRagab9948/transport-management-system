import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentReason, VehicleStatus } from '@prisma/client';
import { AuditService } from '../../../common/services/audit.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { VehicleAssignmentsService } from './vehicle-assignments.service';

describe('VehicleAssignmentsService', () => {
  let service: VehicleAssignmentsService;
  let prisma: any;
  let auditService: jest.Mocked<AuditService>;

  const now = new Date();

  const mockVehicle = { id: 'vehicle-1', vehicleCode: 'TRK-001', status: VehicleStatus.ACTIVE };
  const mockSubSector = { id: 'sub-1', sectorId: 'sector-1', name: 'North', code: 'NTH', status: 'ACTIVE', sector: { id: 'sector-1', name: 'Test' } };
  const mockAnotherSubSector = { id: 'sub-2', sectorId: 'sector-1', name: 'South', code: 'STH', status: 'ACTIVE' };

  const mockPrisma = {
    vehicle: { findUnique: jest.fn() },
    subSector: { findUnique: jest.fn() },
    vehicleAssignment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    vehicleAssignmentHistory: { create: jest.fn() },
    trip: { findFirst: jest.fn() },
    $transaction: jest.fn().mockImplementation((fn: (tx: any) => any) => fn(mockPrisma)),
  };

  const mockAuditService = {
    log: jest.fn(),
  } as unknown as jest.Mocked<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleAssignmentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<VehicleAssignmentsService>(VehicleAssignmentsService);
    prisma = module.get(PrismaService);
    auditService = module.get(AuditService);

    jest.clearAllMocks();
  });

  // ------------------------------------------------
  // ASSIGN
  // ------------------------------------------------
  describe('assign', () => {
    const dto = { subSectorId: 'sub-1', notes: 'Initial assignment' };

    it('PASS: should assign a vehicle to a sub-sector', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.subSector.findUnique.mockResolvedValue(mockSubSector);

      const createdAssignment = {
        id: 'assign-1',
        vehicleId: 'vehicle-1',
        subSectorId: 'sub-1',
        assignedAt: now,
        unassignedAt: null,
        notes: 'Initial assignment',
        vehicle: mockVehicle,
        subSector: mockSubSector,
      };
      mockPrisma.vehicleAssignment.create.mockResolvedValue(createdAssignment);
      mockPrisma.vehicleAssignmentHistory.create.mockResolvedValue({});

      const result = await service.assign('vehicle-1', dto, 'user-1');

      expect(prisma.vehicleAssignment.create).toHaveBeenCalledWith({
        data: { vehicleId: 'vehicle-1', subSectorId: 'sub-1', notes: 'Initial assignment' },
        include: { vehicle: true, subSector: { include: { sector: true } } },
      });
      expect(prisma.vehicleAssignmentHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          vehicleId: 'vehicle-1',
          subSectorId: 'sub-1',
          reason: 'ASSIGNMENT',
          changedById: 'user-1',
        }),
      });
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'VEHICLE_ASSIGNED' }),
      );
      expect(result).toEqual(createdAssignment);
    });

    it('FAIL: should throw NotFoundException when vehicle missing', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.assign('missing', dto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('FAIL: should throw BadRequestException when vehicle in maintenance', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ ...mockVehicle, status: VehicleStatus.IN_MAINTENANCE });

      await expect(service.assign('vehicle-1', dto, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('FAIL: should throw BadRequestException when vehicle out of service', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ ...mockVehicle, status: VehicleStatus.OUT_OF_SERVICE });

      await expect(service.assign('vehicle-1', dto, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('FAIL: should throw ConflictException when vehicle already has active assignment', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue({ id: 'existing', unassignedAt: null });

      await expect(service.assign('vehicle-1', dto, 'user-1')).rejects.toThrow(ConflictException);
    });

    it('FAIL: should throw NotFoundException when sub-sector missing', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.subSector.findUnique.mockResolvedValue(null);

      await expect(service.assign('vehicle-1', dto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('FAIL: should throw BadRequestException when sub-sector is inactive', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.subSector.findUnique.mockResolvedValue({ ...mockSubSector, status: 'INACTIVE' });

      await expect(service.assign('vehicle-1', dto, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ------------------------------------------------
  // TRANSFER
  // ------------------------------------------------
  describe('transfer', () => {
    const dto = { targetSubSectorId: 'sub-2' };
    const activeAssignment = {
      id: 'assign-1',
      vehicleId: 'vehicle-1',
      subSectorId: 'sub-1',
      assignedAt: now,
      unassignedAt: null,
      subSector: mockSubSector,
    };

    it('PASS: should transfer a vehicle to another sub-sector', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(activeAssignment);
      mockPrisma.trip.findFirst.mockResolvedValue(null);
      mockPrisma.subSector.findUnique.mockResolvedValue(mockAnotherSubSector);

      const newAssignment = {
        id: 'assign-2',
        vehicleId: 'vehicle-1',
        subSectorId: 'sub-2',
        assignedAt: now,
        unassignedAt: null,
        vehicle: mockVehicle,
        subSector: mockAnotherSubSector,
      };
      mockPrisma.vehicleAssignment.create.mockResolvedValue(newAssignment);
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        await fn(mockPrisma);
        return [newAssignment];
      });

      const result = await service.transfer('vehicle-1', dto, 'user-1');

      expect(result).toEqual(newAssignment);
    });

    it('FAIL: should throw NotFoundException when vehicle missing', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.transfer('missing', dto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('FAIL: should throw BadRequestException when no active assignment', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(null);

      await expect(service.transfer('vehicle-1', dto, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('FAIL: should throw BadRequestException when vehicle has active trip', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(activeAssignment);
      mockPrisma.trip.findFirst.mockResolvedValue({ id: 'trip-1' });

      await expect(service.transfer('vehicle-1', dto, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('FAIL: should throw BadRequestException when target sub-sector is the same', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(activeAssignment);
      mockPrisma.trip.findFirst.mockResolvedValue(null);
      mockPrisma.subSector.findUnique.mockResolvedValue(mockSubSector);

      await expect(service.transfer('vehicle-1', { targetSubSectorId: 'sub-1' }, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('FAIL: should throw NotFoundException when target sub-sector missing', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(activeAssignment);
      mockPrisma.trip.findFirst.mockResolvedValue(null);
      mockPrisma.subSector.findUnique.mockResolvedValue(null);

      await expect(service.transfer('vehicle-1', dto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('FAIL: should throw BadRequestException when target sub-sector is inactive', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(activeAssignment);
      mockPrisma.trip.findFirst.mockResolvedValue(null);
      mockPrisma.subSector.findUnique.mockResolvedValue({ ...mockAnotherSubSector, status: 'INACTIVE' });

      await expect(service.transfer('vehicle-1', dto, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ------------------------------------------------
  // UNASSIGN
  // ------------------------------------------------
  describe('unassign', () => {
    const activeAssignment = {
      id: 'assign-1',
      vehicleId: 'vehicle-1',
      subSectorId: 'sub-1',
      assignedAt: now,
      unassignedAt: null,
      subSector: mockSubSector,
    };

    it('PASS: should unassign a vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(activeAssignment);
      mockPrisma.trip.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));

      await service.unassign('vehicle-1', { notes: 'End of assignment' }, 'user-1');

      expect(prisma.vehicleAssignment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'assign-1' },
          data: expect.objectContaining({ unassignedAt: expect.any(Date) }),
        }),
      );
      expect(prisma.vehicleAssignmentHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            vehicleId: 'vehicle-1',
            subSectorId: 'sub-1',
            reason: 'UNASSIGNMENT',
            notes: 'End of assignment',
            changedById: 'user-1',
          }),
        }),
      );
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'VEHICLE_UNASSIGNED' }),
      );
    });

    it('FAIL: should throw BadRequestException when no active assignment', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(null);

      await expect(service.unassign('vehicle-1', {}, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('FAIL: should throw BadRequestException when vehicle has active trip', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.vehicleAssignment.findFirst.mockResolvedValue(activeAssignment);
      mockPrisma.trip.findFirst.mockResolvedValue({ id: 'trip-1' });

      await expect(service.unassign('vehicle-1', {}, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('FAIL: should throw NotFoundException when vehicle missing', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.unassign('missing', {}, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
