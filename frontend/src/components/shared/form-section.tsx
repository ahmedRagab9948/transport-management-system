import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { slideUp } from '@/lib/design';

interface FormSectionProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, icon: Icon, description, children, className }: FormSectionProps) {
  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className={cn('overflow-hidden rounded-lg border border-border bg-card shadow-sm', className)}
    >
      <div className="flex items-center gap-3 border-b border-border/40 bg-muted/20 px-5 py-3.5">
        {Icon ? (
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        ) : null}
        <div className="flex-1">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}
