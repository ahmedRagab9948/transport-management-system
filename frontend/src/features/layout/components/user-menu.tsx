'use client';

import { LogOut, Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useT } from '@/lib/i18n';

function getInitials(name: string): string {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const { user, logout, logoutAll } = useAuth();
  const { t } = useT();
  const router = useRouter();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="sm" className="gap-2.5 px-2 hover:bg-muted/50 rounded-lg transition-all duration-200 active:scale-[0.98]">
          <Avatar size="sm" className="ring-2 ring-primary/10 transition-all duration-200 group-hover:ring-primary/20"><AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">{getInitials(user.fullName)}</AvatarFallback></Avatar>
          <span className="hidden max-w-[8rem] truncate text-start sm:inline-flex flex-col gap-0.5">
            <span className="block text-xs font-bold leading-none text-foreground tracking-tight">{user.fullName}</span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">{user.roleName}</span>
          </span>
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-56 mt-1.5 shadow-md border-border/80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-foreground tracking-tight leading-none">{user.fullName}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">{user.email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push(ROUTES.profile)} className="cursor-pointer"><User className="size-4 text-muted-foreground" /> <span className="font-medium">{t('auth.profile')}</span></DropdownMenuItem>
          <DropdownMenuItem disabled className="opacity-65"><Shield className="size-4 text-muted-foreground" /> <span className="font-medium">{t('auth.permissions_count', { count: user.permissions.length })}</span></DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => logout()} className="font-medium cursor-pointer"><LogOut className="size-4 text-muted-foreground" /> {t('auth.logout')}</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => logoutAll()} className="font-medium cursor-pointer"><LogOut className="size-4" /> {t('auth.logout_all')}</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
