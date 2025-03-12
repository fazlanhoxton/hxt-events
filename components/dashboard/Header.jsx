import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { BellIcon } from "lucide-react";

export function Header() {
  return (
    <div className="border-b h-16 flex items-center px-4 justify-between bg-slate-100">
      <div className="flex items-center">
        <Sidebar isMobile={true} />
        <h1 className="text-xl font-bold md:hidden">Admin Panel</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <BellIcon className="h-5 w-5" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
          FZ
        </div>
      </div>
    </div>
  );
}