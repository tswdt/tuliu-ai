import AppNavbar from '@/components/app-navbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <AppNavbar />
      <main>{children}</main>
    </div>
  );
}
