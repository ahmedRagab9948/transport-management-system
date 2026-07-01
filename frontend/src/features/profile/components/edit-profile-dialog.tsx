'use client';

import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { useUpdateProfile } from '../hooks/use-profile';
import type { Profile } from '../types/profile.types';
import { AvatarUploader } from './avatar-uploader';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

function createSchema(t: (key: string) => string) {
  return z.object({
    fullName: z.string().min(1, t('validation.required')).max(255),
    phone: z.string().optional(),
    preferredLanguage: z.enum(['ar', 'en']),
  });
}

type FormValues = z.infer<ReturnType<typeof createSchema>>;

export function EditProfileDialog({ open, onOpenChange, profile }: EditProfileDialogProps) {
  const { t } = useT();
  const mutation = useUpdateProfile();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileReaderRef = useRef<string | null>(null);

  const schema = createSchema(t);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile.fullName,
      phone: profile.phone ?? '',
      preferredLanguage: profile.preferredLanguage as 'ar' | 'en',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        fullName: profile.fullName,
        phone: profile.phone ?? '',
        preferredLanguage: profile.preferredLanguage as 'ar' | 'en',
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [open, profile, form]);

  useEffect(() => {
    return () => {
      if (fileReaderRef.current) {
        URL.revokeObjectURL(fileReaderRef.current);
      }
    };
  }, []);

  function handleFileSelect(file: File) {
    setAvatarFile(file);
    if (fileReaderRef.current) {
      URL.revokeObjectURL(fileReaderRef.current);
    }
    const preview = URL.createObjectURL(file);
    fileReaderRef.current = preview;
    setAvatarPreview(preview);
  }

  async function handleSubmit(values: FormValues) {
    const payload: Parameters<typeof mutation.mutate>[0] = {};

    if (values.fullName !== profile.fullName) payload.fullName = values.fullName;
    if (values.phone !== (profile.phone ?? '')) payload.phone = values.phone || undefined;
    if (values.preferredLanguage !== profile.preferredLanguage) payload.preferredLanguage = values.preferredLanguage;

    if (avatarFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        payload.avatar = reader.result as string;
        mutation.mutate(payload, {
          onSuccess: () => onOpenChange(false),
        });
      };
      reader.readAsDataURL(avatarFile);
      return;
    }

    mutation.mutate(payload, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('profile.edit_profile')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="flex justify-center">
            <AvatarUploader
              currentAvatar={avatarPreview ?? profile.avatar}
              fullName={profile.fullName}
              onFileSelect={handleFileSelect}
              disabled={mutation.isPending}
            />
          </div>

          <Field data-invalid={!!form.formState.errors.fullName}>
            <FieldLabel htmlFor="edit-full-name">{t('profile.full_name')}</FieldLabel>
            <Input id="edit-full-name" aria-invalid={!!form.formState.errors.fullName} {...form.register('fullName')} />
            <FieldError errors={[form.formState.errors.fullName]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.phone}>
            <FieldLabel htmlFor="edit-phone">{t('profile.phone')}</FieldLabel>
            <Input id="edit-phone" aria-invalid={!!form.formState.errors.phone} {...form.register('phone')} />
            <FieldError errors={[form.formState.errors.phone]} />
          </Field>

          <Controller
            control={form.control}
            name="preferredLanguage"
            render={({ field }) => (
              <Field>
                <FieldLabel>{t('profile.language')}</FieldLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value === 'ar' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => field.onChange('ar')}
                  >
                    {t('profile.arabic')}
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === 'en' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => field.onChange('en')}
                  >
                    {t('profile.english')}
                  </Button>
                </div>
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
