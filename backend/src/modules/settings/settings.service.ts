import { Injectable } from '@nestjs/common';
import { AuditService } from '../../common/services/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsAuditAction, SETTINGS_ENTITY_TYPE } from './enums/settings-audit-action.enum';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import type { UpdateSettingsDto } from './dto/update-settings.dto';

const SETTING_GROUPS: Record<string, string[]> = {
  General: [
    'applicationName', 'companyName', 'companyEmail', 'companyPhone',
    'companyAddress', 'companyLogo', 'timezone', 'dateFormat', 'timeFormat',
    'language', 'rtlPreview',
  ],
  Localization: [
    'defaultLanguage', 'supportedLanguages', 'defaultCurrency', 'country', 'numberFormat',
  ],
  Notifications: [
    'emailNotifications', 'inAppNotifications', 'smsEnabled', 'sessionTimeout',
    'loginAlerts', 'passwordExpiration',
  ],
  Security: [
    'passwordMinLength', 'passwordRequireUppercase', 'passwordRequireNumbers',
    'passwordRequireSymbols', 'maxLoginAttempts', 'lockoutDuration', 'mfaEnabled',
  ],
  System: [
    'version', 'environment', 'database', 'storage', 'healthStatus', 'buildVersion',
  ],
};

const DEFAULT_VALUES: Record<string, string> = {
  applicationName: 'TMS Enterprise',
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  companyLogo: '',
  timezone: 'Africa/Cairo',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  language: 'ar',
  rtlPreview: 'true',
  defaultLanguage: 'ar',
  supportedLanguages: 'ar,en',
  defaultCurrency: 'EGP',
  country: 'EG',
  numberFormat: '#,##0.00',
  emailNotifications: 'true',
  inAppNotifications: 'true',
  smsEnabled: 'false',
  sessionTimeout: '30',
  loginAlerts: 'true',
  passwordExpiration: '90',
  passwordMinLength: '8',
  passwordRequireUppercase: 'true',
  passwordRequireNumbers: 'true',
  passwordRequireSymbols: 'false',
  maxLoginAttempts: '5',
  lockoutDuration: '15',
  mfaEnabled: 'false',
  version: '1.0.0',
  environment: 'development',
  database: 'PostgreSQL',
  storage: 'Local',
  healthStatus: 'Healthy',
  buildVersion: '1.0.0',
};

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    const settings = await this.prisma.systemSetting.findMany({
      where: { isActive: true },
    });

    const settingMap = new Map(settings.map((s: { key: string; value: string | null }) => [s.key, s.value]));

    const result: Record<string, Record<string, string>> = {};

    for (const [group, keys] of Object.entries(SETTING_GROUPS)) {
      const groupSettings: Record<string, string> = {};
      for (const key of keys) {
        groupSettings[key] = settingMap.get(key) ?? DEFAULT_VALUES[key] ?? '';
      }
      result[group] = groupSettings;
    }

    return result;
  }

  async update(
    dto: UpdateSettingsDto,
    user: AuthenticatedUser,
    requestMeta?: { ipAddress?: string; userAgent?: string },
  ) {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined && value !== null,
    );

    if (entries.length === 0) {
      return this.findAll();
    }

    const oldValues: Record<string, string> = {};
    const newValues: Record<string, string> = {};

    for (const [key, value] of entries) {
      const existing = await this.prisma.systemSetting.findUnique({
        where: { key },
      });

      if (existing) {
        oldValues[key] = existing.value ?? '';
      } else {
        oldValues[key] = DEFAULT_VALUES[key] ?? '';
      }

      newValues[key] = value;
    }

    for (const [key, value] of entries) {
      await this.prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: {
          key,
          value,
          group: this.resolveGroup(key),
          type: 'string',
        },
      });
    }

    await this.auditService.log({
      userId: user.id,
      action: SettingsAuditAction.UPDATE,
      entityType: SETTINGS_ENTITY_TYPE,
      entityId: undefined,
      oldValues,
      newValues,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent,
    });

    return this.findAll();
  }

  private resolveGroup(key: string): string {
    for (const [group, keys] of Object.entries(SETTING_GROUPS)) {
      if (keys.includes(key)) return group;
    }
    return 'General';
  }
}
