'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldContent } from '@/components/ui/field';
import { useT } from '@/lib/i18n';
import { useUpdateSettings } from '../hooks/use-settings';

interface SettingsField {
  key: string;
  labelKey: string;
  readOnly?: boolean;
}

interface SettingsCardProps {
  titleKey: string;
  fields: readonly SettingsField[];
  data: Record<string, string>;
}

export function SettingsCard({ titleKey, fields, data }: SettingsCardProps) {
  const { t } = useT();
  const mutation = useUpdateSettings();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      initial[field.key] = data[field.key] ?? '';
    }
    setValues(initial);
  }, [data, fields]);

  const hasChanges = useMemo(() => {
    return fields.some((field) => {
      if (field.readOnly) return false;
      return values[field.key] !== (data[field.key] ?? '');
    });
  }, [values, data, fields]);

  const handleChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCancel = useCallback(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      initial[field.key] = data[field.key] ?? '';
    }
    setValues(initial);
  }, [data, fields]);

  const handleSave = useCallback(() => {
    const payload: Record<string, string> = {};
    for (const field of fields) {
      if (field.readOnly) continue;
      const currentValue = values[field.key];
      const originalValue = data[field.key] ?? '';
      if (currentValue !== originalValue) {
        payload[field.key] = currentValue ?? '';
      }
    }
    if (Object.keys(payload).length > 0) {
      mutation.mutate(payload);
    }
  }, [values, data, fields, mutation]);

  const isPending = mutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field) => (
            <Field key={field.key} orientation="responsive">
              <FieldLabel>{t(field.labelKey)}</FieldLabel>
              <FieldContent>
                <Input
                  name={field.key}
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  readOnly={field.readOnly}
                  aria-label={t(field.labelKey)}
                />
              </FieldContent>
            </Field>
          ))}
        </div>
      </CardContent>
      {!fields.some((f) => f.readOnly) && (
        <CardFooter className="gap-2">
          <Button variant="outline" type="button" disabled={!hasChanges || isPending} onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={handleSave} disabled={!hasChanges} loading={isPending}>
            {t('common.save')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
