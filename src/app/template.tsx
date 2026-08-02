'use client'

import { PageTransition } from '@/components/ui/motion'

/** Transition appliquee a chaque navigation. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
