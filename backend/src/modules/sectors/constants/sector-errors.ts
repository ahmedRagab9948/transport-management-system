export const SECTOR_ERRORS = {
  NOT_FOUND: 'Sector not found',
  NAME_EXISTS: 'A sector with this name already exists',
  CODE_EXISTS: 'A sector with this code already exists',
  HAS_ACTIVE_ASSIGNMENTS: 'Cannot deactivate sector with active vehicle assignments. Transfer or unassign all vehicles first.',
  SUB_SECTOR_NOT_FOUND: 'Sub-sector not found',
  SUB_SECTOR_NAME_EXISTS: 'A sub-sector with this name already exists in this sector',
  SUB_SECTOR_CODE_EXISTS: 'A sub-sector with this code already exists in this sector',
  SUB_SECTOR_HAS_ASSIGNMENTS: 'Cannot deactivate sub-sector with active vehicle assignments. Transfer or unassign all vehicles first.',
  LAST_ACTIVE_SUB_SECTOR: 'Cannot deactivate the last active sub-sector in this sector. Deactivate the sector instead.',
} as const;
