import { BottomNav } from '@/components/BottomNav';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-28 pt-4">
      {children}
      <BottomNav />
    </div>
  );
}
