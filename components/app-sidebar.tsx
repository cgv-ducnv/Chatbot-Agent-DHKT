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

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof UISidebar>) {
  const { user, permissions } = useAuth();
  const { config } = useSidebarConfig();

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
        <div className="w-full px-3 pb-3">
          <div
            className="rounded-xl border border-emerald-500/20 
              bg-emerald-500/5 px-3 py-2 
              text-[11px] text-muted-foreground text-center"
          >
            <div>Phát triển bởi CGV Telecom</div>
            <div className="opacity-70">© {new Date().getFullYear()}</div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </UISidebar>
  );
}
