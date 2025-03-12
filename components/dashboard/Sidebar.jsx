import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, LayoutDashboard, Settings, Users, BarChart3, Package, FileCog, MapPinHouse} from "lucide-react";

export function Sidebar({ className, isMobile }) {
  const routes = [
    {
      label: 'Events',
      icon: Home,
      href: '/dashboard',
    },
    {
      label: 'Venues',
      icon: MapPinHouse,
      href: '/dashboard/venues',
    },
    {
      label: 'Products',
      icon: Package,
      href: '/dashboard/products',
    },
    {
      label: 'Customers',
      icon: Users,
      href: '/dashboard/customers',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
    },
  ];

  const SidebarContent = () => (
    <div className="px-3 py-2 flex flex-col h-full bg-slate-100">
      <div className="flex items-center pl-3 mb-6">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <Separator className="mb-6" />
      <div className="flex flex-col gap-2 flex-1">
        {routes.map((route) => {
          const Icon = route.icon;
          return (
            <Button
              key={route.href}
              variant="ghost"
              className="justify-start gap-2"
              asChild
            >
              <Link href={route.href}>
                <Icon className="h-5 w-5" />
                {route.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );

  // For mobile: render a sheet (offcanvas/drawer)
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop: render a regular sidebar
  return (
    <div className={cn("hidden md:flex h-screen w-[240px] flex-col border-r", className)}>
      <SidebarContent />
    </div>
  );
}