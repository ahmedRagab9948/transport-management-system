'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { slideUp } from '@/lib/design';

interface FormCardProps {
  children: React.ReactNode;
}

export function FormCard({ children }: FormCardProps) {
  return (
    <motion.div variants={slideUp} initial="hidden" animate="visible">
      <Card>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
