"use client";

import { usePathname } from "next/navigation";
import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import { SecondarySidebar } from "@/components/layout/secondary-sidebar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import { useLogout } from "@/hooks/use-logout";
import { useEffect, useState } from "react";
import { SECONDARY_SIDEBAR_PATHS } from "@/lib/navigation";
// import { SECONDARY_SIDEBAR_PATHS } from '@/lib/navigation';

function SidebarContent({
  pathname,
  onLogout,
  open = false,
}: {
  readonly pathname: string;
  readonly onLogout: () => void;
  readonly open?: boolean;
}) {
  return (
    <div className="h-full flex w-[10px] shadow-md">
      <PrimarySidebar pathname={pathname} onLogout={onLogout} />
      <SecondarySidebar pathname={pathname} open={open} />
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { submit: logout } = useLogout();

  const [showSecondary, setShowSecondary] = useState(false);

  const toggleSecondary = () => {
    setShowSecondary((prev) => !prev);
  };

  useEffect(() => {
    const shouldShow = SECONDARY_SIDEBAR_PATHS.some((path) =>
      pathname.startsWith(path)
    );
    setShowSecondary(shouldShow);
  }, [pathname]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <div className="flex flex-col w-16 absolute mt-30">
          <Button
            variant="ghost"
            onClick={toggleSecondary}
            className="cursor-pointer z-50 rounded-none hover:text-white hover:bg-gray-900"
            aria-label="Menu secundário"
            data-cy="toggle-secondary-sidebar"
          >
            <Menu className="!w-7 !h-7" strokeWidth={2.2} />
          </Button>
        </div>
        <SidebarContent
          pathname={pathname}
          onLogout={logout}
          open={showSecondary}
        />
      </div>

      {/* Mobile Sidebar */}
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="fixed top-4 left-4 z-50 md:hidden"
            aria-label="Abrir menu"
            data-cy="mobile-menu-trigger"
          >
            <Menu size={22} strokeWidth={2.2} />
          </Button>
        </DrawerTrigger>

        <DrawerContent
          className="p-0  bg-gray-100 border-none shadow-xl"
          data-cy="mobile-drawer-content"
        >
          <SidebarContent pathname={pathname} onLogout={logout} open={true} />
        </DrawerContent>
      </Drawer>
    </>
  );
}
