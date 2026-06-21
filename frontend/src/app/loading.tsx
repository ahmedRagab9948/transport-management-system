'use client';

import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg"
        >
          <Truck className="size-7" />
        </motion.div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold uppercase tracking-widest text-foreground">
            MASAR
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Transportation & Fleet Management
          </span>
        </div>
      </motion.div>
      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
            className="size-2 rounded-full bg-primary"
          />
        ))}
      </div>
    </div>
  );
}
