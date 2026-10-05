import AppHeader from "@/components/AppHeader";
import NavSidebar from "@/components/NavSidebar";
import NavBottom from "@/components/NavBottom";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="flex">
        <NavSidebar />
        <div className="flex-1 min-w-0 pb-20 lg:pb-0">{children}</div>
      </div>
      <NavBottom />
    </div>
  );
}