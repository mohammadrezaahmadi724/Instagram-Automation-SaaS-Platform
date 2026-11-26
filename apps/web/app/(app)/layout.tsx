import type { ReactNode } from 'react';
import { ShellFrame } from './shell-frame';

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <ShellFrame>{children}</ShellFrame>;
}
