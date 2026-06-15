import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'CraveStop — AI-Powered QSR Campaign Copilot',
  description: 'Turn lapsed QSR customers into timed, margin-aware plays with AI reasoning, personalized offer ladders, delivery receipts, and a learning loop.',
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
