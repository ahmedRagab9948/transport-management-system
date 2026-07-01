'use client';

import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useT } from '@/lib/i18n';

interface AvatarUploaderProps {
  currentAvatar: string | null;
  fullName: string;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function AvatarUploader({ currentAvatar, fullName, onFileSelect, disabled }: AvatarUploaderProps) {
  const { t } = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }

  return (
    <div className="relative inline-block">
      <Avatar className="size-20 border-2 border-border cursor-pointer group" onClick={handleClick}>
        <AvatarImage src={currentAvatar ?? undefined} alt={fullName} />
        <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
          {initials}
        </AvatarFallback>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">
          <Camera className="size-5 text-white" />
        </div>
      </Avatar>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        disabled={disabled}
        aria-label={t('profile.upload_avatar')}
      />
    </div>
  );
}
