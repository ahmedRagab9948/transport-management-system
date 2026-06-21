import type { Variants, Transition } from 'framer-motion';

export const DURATIONS = {
  fast: 0.15,
  normal: 0.2,
  medium: 0.3,
  slow: 0.35,
  stagger: 0.05,
  staggerSm: 0.03,
  staggerLg: 0.08,
} as const;

export const EASINGS = {
  default: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  out: [0, 0, 0.2, 1] as [number, number, number, number],
  in: [0.4, 0, 1, 1] as [number, number, number, number],
  spring: { type: 'spring' as const, stiffness: 300, damping: 24 },
};

export const defaultTransition: Transition = {
  duration: DURATIONS.medium,
  ease: EASINGS.out,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: defaultTransition },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: defaultTransition },
};

export const slideUpSm: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATIONS.normal, ease: EASINGS.out } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: defaultTransition },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: DURATIONS.stagger, delayChildren: 0.05 },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: DURATIONS.staggerSm, delayChildren: 0 },
  },
};

export const expandError: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: DURATIONS.normal } },
};

export const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.01, transition: { duration: DURATIONS.fast, ease: EASINGS.out } },
};
