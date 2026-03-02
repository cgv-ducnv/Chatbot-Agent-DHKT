"use client";

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  Sidebar as UISidebar,
} from "@/components/ui/sidebar";
import { sidebarData } from "@/constants/sidebar-data";
import { useAuth } from "@/contexts/auth-context";
import { useSidebarConfig } from "@/contexts/sidebar-context";
import React, { useMemo } from "react";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import { filterNavGroupsByPermissions } from "@/lib/filter-nav-items";
import { useSidebar } from "@/components/ui/sidebar";

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof UISidebar>) {
  const { user, permissions } = useAuth();
  const { config } = useSidebarConfig();
  // Trong component:
  const { state } = useSidebar(); // "expanded" | "collapsed"
  const isCollapsed = state === "collapsed";
  // Filter nav groups dựa trên user permissions
  const filteredNavGroups = useMemo(() => {
    return filterNavGroupsByPermissions(sidebarData.navGroups, permissions);
  }, [permissions]);

  return (
    <UISidebar
      variant={config.variant}
      collapsible={config.collapsible}
      side={config.side}
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((nav) => (
          <NavGroup key={nav.title} {...nav} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="w-full py-2">
          {isCollapsed ? (
            // Dạng thu gọn: chỉ hiện icon/năm
            <div className="flex items-center justify-center rounded-full">
              <span className="text-[12px] opacity-70 text-center text-white">
                CGV
              </span>
            </div>
          ) : (
            // Dạng đầy đủ
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] text-muted-foreground text-center">
              <div className="text-white">Phát triển bởi CGV Telecom</div>
              <div className="opacity-70 text-white">
                © {new Date().getFullYear()}
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </UISidebar>
  );
}
