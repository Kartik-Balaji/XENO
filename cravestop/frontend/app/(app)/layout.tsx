import { Sidebar } from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FAF7F2] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto ml-64">
        {children}
      </div>
    </div>
  );
}
